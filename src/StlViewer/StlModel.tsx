import React, { CSSProperties, useEffect, useRef, useState } from "react"
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Mesh } from "three";

const CAMERA_OFFSET = 250
const POSITION_FACTOR = 120
const LIGHT_DISTANCE = 200
const REPOSITION_TIMEOUT = 100
const DEFAULT_ROTATION= [-90, 10, -45]

export interface StlModelProps {
    url: string
    color?: CSSProperties["color"]
    extraHeaders?: Record<string, string>
    onFinishLoading?: () => void
}

const StlModel: React.FC<StlModelProps> = (
    {
        url,
        color = "grey",
        extraHeaders,
        onFinishLoading,
    }
) => {
    const {camera} = useThree()
    const controls = useRef<any>()
    const mesh = useRef<Mesh>()
    const [position, setPosition] = useState<[number, number, number] | null>(null)

    const geometry = useLoader(
        STLLoader,
        url,
        ((loader) => loader.setRequestHeader(extraHeaders))
    )

    useEffect(() => {
        setPosition(null)
    }, [geometry])

    useFrame(() => {
        if (position || !geometry.boundingSphere) {
            return
        }
        const {center: {x, y, z}, radius} = geometry.boundingSphere
        const f = radius/POSITION_FACTOR
        camera.position.set(-CAMERA_OFFSET*f, CAMERA_OFFSET*f, 0)
        controls.current?.update()
        setTimeout(() => {
            setPosition([-x, -y, -z])
            onFinishLoading && onFinishLoading()
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
