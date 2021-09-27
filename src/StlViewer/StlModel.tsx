import React, { CSSProperties, useEffect, useRef, useState } from "react"
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Mesh, Box3, Group } from "three";

const CAMERA_OFFSET = 220
const POSITION_FACTOR = 120
const LIGHT_DISTANCE = 300
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
    const group = useRef<Group>()
    const mesh = useRef<Mesh>()
    const [loading, setLoading] = useState(false)

    const [position, setPosition] = useState<[number, number, number]>([0, 0, 0])
    const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 0, 0])

    const geometry = useLoader(
        STLLoader,
        url,
        ((loader) => loader.setRequestHeader(extraHeaders))
    )

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
        setCameraPos([-CAMERA_OFFSET*f, CAMERA_OFFSET*f, 0])
        setPosition([-x, -y, -z])
        onFinishLoading && onFinishLoading(finish)
        setLoading(false)
    })

    const rotation = DEFAULT_ROTATION.map(n => n*Math.PI/180) as [number, number, number]

    return (
        <>
            <PerspectiveCamera
                makeDefault
                position={cameraPos}
                near={1}
                far={1000}
                {...{} as any}
            />
            <OrbitControls />
            <group ref={group} rotation={rotation}>
                <mesh ref={mesh} position={position}>
                    <primitive object={geometry} attach={"geometry"} />
                    <meshStandardMaterial
                        color={color}
                        opacity={position? 1:0}
                    />
                </mesh>
            </group>
            <ambientLight/>
            <pointLight position={[-LIGHT_DISTANCE, LIGHT_DISTANCE, LIGHT_DISTANCE]}/>
            <pointLight position={[LIGHT_DISTANCE, -LIGHT_DISTANCE, -LIGHT_DISTANCE]}/>
        </>
    )
}

export default StlModel
