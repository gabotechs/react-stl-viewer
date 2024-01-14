import React, { CSSProperties, useEffect, useMemo, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { STLLoader } from 'three-stdlib/loaders/STLLoader'
import { Box3, BufferGeometry, Color, Group, Mesh } from 'three'
import { STLExporter } from './exporters/STLExporter'
import Model3D, { ModelDimensions } from './SceneElements/Model3D'
import Floor from './SceneElements/Floor'
import Lights from './SceneElements/Lights'
import Camera, { CameraPosition, polarToCartesian } from './SceneElements/Camera'
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

export interface CameraRef {
  setCameraPosition: (position: CameraPosition) => any
}

export interface CameraProps {
  ref?: { current?: null | CameraRef }
  initialPosition?: CameraPosition
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
  /** @deprecated use cameraProps.initialPosition instead */
  cameraInitialPosition?: Partial<CameraPosition>
  extraHeaders?: Record<string, string>
  shadows?: boolean
  showAxes?: boolean
  orbitControls?: boolean
  onFinishLoading?: (ev: ModelDimensions) => any
  cameraProps?: CameraProps
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
      latitude: deprecatedLatitude,
      longitude: deprecatedLongitude,
      distance: deprecatedDistanceFactor
    } = {},
    cameraProps: {
      ref: cameraRef,
      initialPosition: {
        latitude = INITIAL_LATITUDE,
        longitude = INITIAL_LONGITUDE,
        distance: distanceFactor = undefined
      } = {}
    } = {},
    modelProps: {
      ref: modelRef,
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
  const { camera } = useThree()
  const [mesh, setMesh] = useState<Mesh>()

  const [meshDims, setMeshDims] = useState<ModelDimensions>({
    width: 0,
    height: 0,
    length: 0,
    boundingRadius: 0
  })

  const [cameraInitialPosition, setCameraInitialPosition] = useState<CameraPosition>()

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

  function calculateCameraDistance (boundingRadius: number, factor?: number): number {
    const maxGridDimension = Math.max(gridWidth ?? 0, gridLength ?? 0)
    if (maxGridDimension > 0) {
      return maxGridDimension * (factor ?? 1)
    } else {
      return boundingRadius * (factor ?? CAMERA_POSITION_DISTANCE_FACTOR)
    }
  }

  function onLoaded (dims: ModelDimensions, mesh: Mesh): void {
    setMesh(mesh)
    const { width, length, height, boundingRadius } = dims
    setMeshDims(dims)
    setModelCenter([positionX ?? width/2, positionY ?? length/2, height/2])
    setCameraInitialPosition({
      latitude: deprecatedLatitude ?? latitude,
      longitude: deprecatedLongitude ?? longitude,
      distance: calculateCameraDistance(boundingRadius, deprecatedDistanceFactor ?? distanceFactor)
    })
    onFinishLoading(dims)
    setTimeout(() => setSceneReady(true), 100) // let the three.js render loop place things
  }

  useEffect(() => {
    if (cameraRef == null) return
    cameraRef.current = {
      setCameraPosition: ({ latitude, longitude, distance: factor }) => {
        const distance = calculateCameraDistance(meshDims.boundingRadius, factor)
        const [x, y, z] = polarToCartesian({ latitude, longitude, distance })
        const [cx, cy, cz] = modelCenter
        camera.position.set(x + cx, y + cy, z + cz)
        camera.lookAt(cx, cy, cz)
      }
    }
  }, [camera, cameraRef, modelCenter, meshDims])

  useEffect(() => {
    if ((modelRef == null) || (mesh == null)) return
    modelRef.current = {
      save: () => new Blob(
        [new STLExporter().parse(mesh, { binary: true })],
        { type: 'application/octet-stream' }
      ),
      model: mesh
    }
  }, [mesh, modelRef])

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
