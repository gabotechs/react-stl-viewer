import React, { CSSProperties, useEffect, useState, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib/loaders/STLLoader'
import { Box3, Color, Group, Mesh } from 'three'
import { STLExporter } from './exporters/STLExporter'
import Model3D, { ModelDimensions } from './SceneElements/Model3D'
import Floor from './SceneElements/Floor'
import Lights from './SceneElements/Lights'
import Camera, { CameraInitialPosition } from './SceneElements/Camera'
import OrbitControls from './SceneElements/OrbitControls'
import { LoopSubdivision } from 'three-subdivide'

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
}

export interface SceneSetupProps {
  url: string
  extraHeaders?: Record<string, string>
  shadows?: boolean
  showAxes?: boolean
  orbitControls?: boolean
  onFinishLoading?: (ev: ModelDimensions) => any
  modelProps?: ModelProps
  floorProps?: FloorProps
  subdivide?: number
}

const SceneSetup: React.FC<SceneSetupProps> = (
  {
    url,
    extraHeaders,
    shadows = false,
    showAxes = false,
    orbitControls = false,
    onFinishLoading = () => { },
    subdivide = 0,
    modelProps: {
      ref,
      scale = 1,
      positionX,
      positionY,
      rotationX = 0,
      rotationY = 0,
      rotationZ = 0,
      color = 'grey'
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

  const subdividedGeometry = useMemo(() => {
    return LoopSubdivision.modify(geometry, subdivide, {
      split: true,
      uvSmooth: false,
      preserveEdges: false,
      flatOnly: false,
      maxTriangles: Infinity
    })
  }, [geometry, subdivide])



  function onLoaded(dims: ModelDimensions, mesh: Mesh): void {
    setMesh(mesh)
    const { width, length, height, boundingRadius } = dims
    setMeshDims(dims)
    setModelCenter([positionX ?? width / 2, positionY ?? length / 2, height / 2])
    const maxGridDimension = Math.max(gridWidth ?? 0, gridLength ?? 0)
    const distance = maxGridDimension > 0
      ? maxGridDimension
      : boundingRadius * CAMERA_POSITION_DISTANCE_FACTOR
    setCameraInitialPosition({
      latitude: INITIAL_LATITUDE,
      longitude: INITIAL_LONGITUDE,
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
    const height = bbox.max.z - bbox.min.z
    group.position.z = height / 2
  })

  const modelPosition: [number, number, number] = [
    positionX ?? (meshDims.width * scale) / 2,
    positionY ?? (meshDims.length * scale) / 2,
    0
  ]

  return (
    <>
      <scene background={BACKGROUND} />
      {sceneReady && showAxes && <axesHelper scale={[50, 50, 50]} />}
      {(cameraInitialPosition != null) && <Camera
        initialPosition={cameraInitialPosition}
        center={modelCenter}
      />}
      <Model3D
        name={'group'}
        meshProps={{ name: 'mesh' }}
        scale={scale}
        geometry={subdividedGeometry}
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
