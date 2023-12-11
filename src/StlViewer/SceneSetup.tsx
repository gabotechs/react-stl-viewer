import React, { CSSProperties, useEffect, useMemo, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib/loaders/STLLoader'
import { Box3, BufferGeometry, Color, Group, Mesh } from 'three'
import { STLExporter } from './exporters/STLExporter'
import Model3D, { ModelDimensions } from './SceneElements/Model3D'
import Floor from './SceneElements/Floor'
import Lights from './SceneElements/Lights'
import Camera, { CameraInitialPosition } from './SceneElements/Camera'
import OrbitControls from './SceneElements/OrbitControls'

const INITIAL_LATITUDE = Math.PI / 8
const INITIAL_LONGITUDE = -Math.PI / 8
const CAMERA_POSITION_DISTANCE_FACTOR = 3
const LIGHT_DISTANCE = 350
const FLOOR_DISTANCE = 0.4
const BACKGROUND = new Color('white')

export interface FloorProps {
  gridWidth?: number
  gridLength?: number
}

export interface ModelRef {
  model: Mesh
  save: () => Blob
}

export interface ModelProps {
  ref?: { current?: null | ModelRef }
  scale?: number
  positionX?: number
  positionY?: number
  rotationX?: number
  rotationY?: number
  rotationZ?: number
  color?: CSSProperties['color']
  geometryProcessor?: (geometry: BufferGeometry) => BufferGeometry
}

export interface SceneSetupProps {
  url: string
  cameraInitialPosition?: Partial<CameraInitialPosition>
  extraHeaders?: Record<string, string>
  shadows?: boolean
  showAxes?: boolean
  orbitControls?: boolean
  onFinishLoading?: (ev: ModelDimensions) => any
  modelProps?: ModelProps
  floorProps?: FloorProps
}

const SceneSetup: React.FC<SceneSetupProps> = (
  {
    url,
    extraHeaders,
    shadows = false,
    showAxes = false,
    orbitControls = false,
    onFinishLoading = () => {},
    cameraInitialPosition: {
      latitude = INITIAL_LATITUDE,
      longitude = INITIAL_LONGITUDE,
      distance: distanceFactor
    } = {},
    modelProps: {
      ref,
      scale = 1,
      positionX,
      positionY,
      rotationX = 0,
      rotationY = 0,
      rotationZ = 0,
      color = 'grey',
      geometryProcessor
    } = {},
    floorProps: {
      gridWidth,
      gridLength
    } = {}
  }
) => {
  const [mesh, setMesh] = useState<Mesh>()

  const [meshDims, setMeshDims] = useState<ModelDimensions>({
    width: 0,
    height: 0,
    length: 0,
    boundingRadius: 0
  })

  const [cameraInitialPosition, setCameraInitialPosition] = useState<CameraInitialPosition>()

  const [modelCenter, setModelCenter] = useState<[number, number, number]>([0, 0, 0])
  const [sceneReady, setSceneReady] = useState(false)
  useEffect(() => {
    setSceneReady(false)
  }, [url])

  const geometry = useLoader(
    STLLoader,
    url,
    (loader) => loader.setRequestHeader(extraHeaders ?? {})
  )

  const processedGeometry = useMemo(
    () => geometryProcessor?.(geometry) ?? geometry,
    [geometry, geometryProcessor]
  )

  function onLoaded (dims: ModelDimensions, mesh: Mesh): void {
    setMesh(mesh)
    const { width, length, height, boundingRadius } = dims
    setMeshDims(dims)
    setModelCenter([positionX ?? width/2, positionY ?? length/2, height/2])
    const maxGridDimension = Math.max(gridWidth ?? 0, gridLength ?? 0)
    let distance
    if (maxGridDimension > 0) {
      distance = maxGridDimension * (distanceFactor ?? 1)
    } else {
      distance = boundingRadius * (distanceFactor ?? CAMERA_POSITION_DISTANCE_FACTOR)
    }
    setCameraInitialPosition({
      latitude,
      longitude,
      distance
    })
    onFinishLoading(dims)
    setTimeout(() => setSceneReady(true), 100) // let the three.js render loop place things
  }

  useEffect(() => {
    if ((ref == null) || (mesh == null)) return
    ref.current = {
      save: () => new Blob(
        [new STLExporter().parse(mesh, { binary: true })],
        { type: 'application/octet-stream' }
      ),
      model: mesh
    }
  }, [mesh, ref])

  useFrame(({ scene }) => {
    const mesh = scene.getObjectByName('mesh') as Mesh
    const group = scene.getObjectByName('group') as Group
    const bbox = new Box3().setFromObject(mesh)
    const height = bbox.max.z-bbox.min.z
    group.position.z = height/2
  })

  const modelPosition: [number, number, number] = [
    positionX ?? (meshDims.width*scale)/2,
    positionY ?? (meshDims.length*scale)/2,
    0
  ]

  return (
        <>
            <scene background={BACKGROUND}/>
            {sceneReady && showAxes && <axesHelper scale={[50, 50, 50]}/>}
            {(cameraInitialPosition != null) && <Camera
                initialPosition={cameraInitialPosition}
                center={modelCenter}
            />}
            <Model3D
                name={'group'}
                meshProps={{ name: 'mesh' }}
                scale={scale}
                geometry={processedGeometry}
                position={modelPosition}
                rotation={[rotationX, rotationY, rotationZ]}
                visible={sceneReady}
                materialProps={{ color }}
                onLoaded={onLoaded}
            />
            <Floor
                width={gridWidth ?? gridLength}
                length={gridLength ?? gridWidth}
                visible={sceneReady}
                noShadow={!shadows}
                offset={FLOOR_DISTANCE}
            />
            <Lights
                distance={LIGHT_DISTANCE}
                offsetX={modelPosition[0]}
                offsetY={modelPosition[1]}
            />
            {sceneReady && orbitControls && <OrbitControls target={modelCenter} />}
        </>
  )
}

export default SceneSetup
