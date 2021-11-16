import React, { CSSProperties, useEffect, useState } from "react"
import { useLoader, useThree } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "@react-three/drei";
import { Box3, Color, Group, Mesh } from "three";
import Model3D, { ModelDimensions } from "./SceneElements/Model3D";
import Floor from "./SceneElements/Floor";
import Lights from "./SceneElements/Lights";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import Camera from "./SceneElements/Camera";

const CAMERA_OFFSET = 150
const POSITION_FACTOR = 140
const LIGHT_DISTANCE = 350
const FLOOR_DISTANCE = .4
const BACKGROUND = new Color("white")

export interface FloorProps {
    gridWidth?: number
    gridLength?: number
}

export interface ModelRef {
    model: Mesh
    save(): Blob
}

export interface ModelProps {
    ref?: {current?: null | ModelRef}
    scale?: number
    positionX?: number
    positionY?: number
    rotationX?: number
    rotationY?: number
    rotationZ?: number
    color?: CSSProperties["color"]
}

export interface SceneSetupProps {
    url: string
    extraHeaders?: Record<string, string>
    shadows?: boolean
    showAxis?: boolean
    orbitControls?: boolean
    onFinishLoading?: (ev: ModelDimensions) => any
    modelProps?: ModelProps
    floorProps?: FloorProps
}


const SceneSetup: React.FC<SceneSetupProps> = (
    {
        url,
        extraHeaders,
        shadows,
        showAxis,
        orbitControls,
        onFinishLoading,
        modelProps: {
            ref,
            scale = 1,
            positionX = 0,
            positionY = 0,
            rotationX = 0,
            rotationY = 0,
            rotationZ = 0,
            color = "grey"
        } = {},
        floorProps: {
            gridWidth = 0,
            gridLength = 0,
        } = {}
    },
) => {
    const {camera} = useThree()
    const [mesh, setMesh] = useState<Mesh>(null)
    const [group, setGroup] = useState<Group>(null)

    const [meshDims, setMeshDims] = useState<ModelDimensions>({
        width: 0,
        height: 0,
        length: 0,
        boundingRadius: 0
    })
    const [zOffset, setZOffset] = useState(0)

    const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0])
    const [sceneReady, setSceneReady] = useState(false)
    useEffect(() => {
        setSceneReady(false)
    }, [url])

    const geometry = useLoader(
        STLLoader,
        url,
        ((loader) => loader.setRequestHeader(extraHeaders))
    )

    function onLoaded(dims: ModelDimensions, mesh: Mesh, group: Group) {
        setMesh(mesh)
        setGroup(group)
        const {width, length, height, boundingRadius} = dims
        setMeshDims(dims)
        const f = boundingRadius/POSITION_FACTOR
        camera.position.set(-CAMERA_OFFSET*f, -CAMERA_OFFSET*f, Math.max(height, 100))
        const target: [number, number, number] = [positionX || width/2, positionY || length/2, height/2]
        camera.lookAt(...target)
        setCameraTarget(target)
        if (onFinishLoading) onFinishLoading(dims)
        setTimeout(() => setSceneReady(true), 100) // let the three.js render loop place things
    }

    useEffect(() => {
        if (!ref) return
        ref.current = {
            save: () => new Blob(
                [new STLExporter().parse(mesh, {binary: true})],
                {type: "application/octet-stream"}
            ),
            model: mesh
        }
    }, [mesh])

    useEffect(() => {
        if (group) setZOffset(-(new Box3().setFromObject(group).min.z))
    }, [rotationZ, rotationX, rotationY, group])

    const cameraPosition: [number, number, number] = [
        -CAMERA_OFFSET * meshDims.boundingRadius/POSITION_FACTOR,
        -CAMERA_OFFSET * meshDims.boundingRadius/POSITION_FACTOR,
        Math.max(meshDims.height, 100)
    ]

    const meshPosition: [number, number, number] = [
        positionX || (meshDims.width*scale)/2,
        positionY || (meshDims.length*scale)/2,
        (meshDims.height*scale)/2+zOffset
    ]

    return (
        <>
            <scene background={BACKGROUND}/>
            {sceneReady && showAxis && <axesHelper scale={[100, 100, 100]}/>}
            <Camera
                position={cameraPosition}
            />
            <Model3D
                scale={scale}
                geometry={geometry}
                position={meshPosition}
                rotation={[rotationX, rotationY, rotationZ]}
                visible={sceneReady}
                materialProps={{color}}
                onLoaded={onLoaded}
            />
            <Floor
                width={gridWidth || gridLength}
                length={gridLength || gridWidth}
                visible={sceneReady}
                noShadow={!shadows}
                offset={FLOOR_DISTANCE}
            />
            <Lights
                distance={LIGHT_DISTANCE}
                offsetX={meshPosition[0]}
                offsetY={meshPosition[1]}
            />
            {sceneReady && orbitControls && <OrbitControls target={cameraTarget} />}
        </>
    )
}

export default SceneSetup
