import React, { useEffect } from 'react'
import { PerspectiveCameraProps, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

export interface CameraInitialPosition {
  latitude: number
  longitude: number
  distance: number
}

export interface CameraProps extends Partial<PerspectiveCameraProps> {
  initialPosition: CameraInitialPosition
  center: [number, number, number]
}

function clamp (min: number, value: number, max: number): number {
  return Math.max(Math.min(value, max), min)
}

const EPS = 0.01

function polarToCartesian (polar: CameraInitialPosition): [number, number, number] {
  const latitude = clamp(-Math.PI / 2 + EPS, polar.latitude, Math.PI / 2 - EPS)
  const longitude = clamp(-Math.PI + EPS, polar.longitude, Math.PI - EPS)
  return [
    polar.distance * Math.cos(latitude) * Math.sin(longitude),
    -polar.distance * Math.cos(longitude) * Math.cos(latitude),
    polar.distance * Math.sin(latitude)
  ]
}

const Camera: React.FC<CameraProps> = (
  {
    initialPosition,
    center,
    ...otherProps
  }
) => {
  const { camera } = useThree()
  useEffect(() => {
    camera.up.applyAxisAngle(new Vector3(1, 0, 0), Math.PI/2)
  }, [camera])

  useEffect(() => {
    const coords = polarToCartesian(initialPosition)
    camera.position.set(coords[0] + center[0], coords[1] + center[1], coords[2] + center[2])
    camera.lookAt(...center)
  }, [camera, center])

  return (
        <perspectiveCamera
            near={1}
            far={1000}
            {...otherProps}
        />
  )
}

export default Camera
