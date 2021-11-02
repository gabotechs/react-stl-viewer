import React, { CSSProperties, useEffect, useRef, useState } from "react"
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Box3, Color, DoubleSide, Group, Mesh } from "three";

const CAMERA_OFFSET = 220
const POSITION_FACTOR = 120
const LIGHT_DISTANCE = 350
const FLOOR_DISTANCE = .2
const DEFAULT_ROTATION: [number, number, number] = [-Math.PI/2, 0, 0]
const BIG_NUM = 2**16
const BACKGROUND = new Color("white")

export interface LoadingFinishedEvent {
    width: number
    height: number
    length: number
}

export interface StlModelProps {
    url: string
    color?: CSSProperties["color"]
    shadows?: boolean
    extraHeaders?: Record<string, string>
    onFinishLoading?: (ev: LoadingFinishedEvent) => void
}

const StlModel: React.FC<StlModelProps> = (
    {
        url,
        color = "grey",
        shadows,
        extraHeaders,
        onFinishLoading,
    }
) => {
    const group = useRef<Group>()
    const mesh = useRef<Mesh>()
    const [loading, setLoading] = useState(false)
    const [floorOffset, setFloorOffset] = useState(0)

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
    }, [url])

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
        geometry.computeVertexNormals()
        setFloorOffset(finish.height/2+FLOOR_DISTANCE)
        const {center: {x, y, z}, radius} = geometry.boundingSphere
        const f = radius/POSITION_FACTOR
        setCameraPos([-CAMERA_OFFSET*f, CAMERA_OFFSET*f*.5, CAMERA_OFFSET*f])
        setPosition([-x, -y, -z])
        onFinishLoading && onFinishLoading(finish)
        setLoading(false)
    })

    return (
        <>
            <scene background={BACKGROUND}/>
            <PerspectiveCamera
                makeDefault
                position={cameraPos}
                near={1}
                far={1000}
                {...{} as any}
            />
            <group ref={group} rotation={DEFAULT_ROTATION}>
                <mesh ref={mesh} position={position} castShadow>
                    <primitive object={geometry} attach={"geometry"} />
                    <meshStandardMaterial
                        side={DoubleSide}
                        color={color}
                        opacity={loading ? 0:1}
                    />
                </mesh>
            </group>
            <group rotation={[-Math.PI/2, 0, 0]} >
                <mesh position={[0, 0, -floorOffset]} receiveShadow  >
                    <planeGeometry args={[BIG_NUM, BIG_NUM]} />
                    <shadowMaterial opacity={shadows ? .2:0} />
                </mesh>
            </group>
            <OrbitControls/>
            <ambientLight/>
            <spotLight
                castShadow
                position={[0, LIGHT_DISTANCE, 0]}
            />
            {[
                [-LIGHT_DISTANCE, LIGHT_DISTANCE, 0],
                [0, LIGHT_DISTANCE, -LIGHT_DISTANCE],
                [0, 0, LIGHT_DISTANCE]
            ].map((position: [number, number, number], index) => (
                <spotLight
                    key={index}
                    intensity={.4}
                    position={position}
                />
            ))}
        </>
    )
}

export default StlModel
