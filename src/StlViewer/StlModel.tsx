import React, { CSSProperties, useEffect, useRef, useState } from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Mesh, Box3 } from "three";

const CAMERA_OFFSET = 250
const POSITION_FACTOR = 120
const LIGHT_DISTANCE = 200
const REPOSITION_TIMEOUT = 100
const DEFAULT_ROTATION= [-90, 10, -45]

export interface LoadingFinishedEvent {
    width: number
    height: number
    length: number
}

export interface StlModelProps {
    url: string
    color?: CSSProperties["color"]
    extraHeaders?: Record<string, string>
    onFinishLoading?: (ev: LoadingFinishedEvent) => void
}

const StlModel: React.FC<StlModelProps> = (
    {
        url,
        color = "grey",
        extraHeaders,
        onFinishLoading,
    }
) => {
    const positionTimeout = useRef(null as null | NodeJS.Timeout)
    const {camera} = useThree()
    const controls = useRef<any>()
    const mesh = useRef<Mesh>()
    const [loading, setLoading] = useState(false)
    const [position, setPosition] = useState<[number, number, number] | null>(null)

    const geometry = useLoader(
        STLLoader,
        url,
        ((loader) => loader.setRequestHeader(extraHeaders))
    )

    useEffect(() => {
        return () => positionTimeout.current && clearTimeout(positionTimeout.current)
    }, [])

    useEffect(() => {
        setLoading(true)
        setPosition(null)
    }, [geometry])

    useFrame(() => {
        if (!loading || !geometry.boundingSphere) {
            return
        }
        new Box3().setFromObject(mesh.current) // this appears to set the correct property on geometry.boundingBox
        const {min, max} = geometry.boundingBox || {min: {x: 0, y: 0, z: 0}, max: {x: 0, y: 0, z: 0}}
        const finish: LoadingFinishedEvent = {
            width: max.x - min.x,
            length: max.y - min.y,
            height: max.z - min.z
        }

        const {center: {x, y, z}, radius} = geometry.boundingSphere
        const f = radius/POSITION_FACTOR
        camera.position.set(-CAMERA_OFFSET*f, CAMERA_OFFSET*f, 0)
        controls.current?.update()
        setLoading(false)
        if (positionTimeout.current) return
        positionTimeout.current = setTimeout(() => {
            setPosition([-x, -y, -z])
            onFinishLoading && onFinishLoading(finish)
            positionTimeout.current = null
        }, REPOSITION_TIMEOUT)
    })

    const rotation = DEFAULT_ROTATION.map(n => n*Math.PI/180) as [number, number, number]

    return (
        <>
            <PerspectiveCamera makeDefault near={1} far={1000}/>
            <OrbitControls ref={controls}/>
            <group rotation={rotation} >
                <mesh ref={mesh} position={position || [0, 0, 0]}>
                    <primitive object={geometry} attach={"geometry"} />
                    <meshStandardMaterial color={color} opacity={position? 1:0}/>
                </mesh>
            </group>
            <ambientLight/>
            <pointLight position={[LIGHT_DISTANCE, LIGHT_DISTANCE, LIGHT_DISTANCE]}/>
            <pointLight position={[-LIGHT_DISTANCE, -LIGHT_DISTANCE, -LIGHT_DISTANCE]}/>
        </>
    )
}

export default StlModel
