import React from 'react'
import { GroupProps } from '@react-three/fiber'

const BIG_NUM = 2**16

export interface FloorProps extends GroupProps {
  visible?: boolean
  width?: number
  length?: number
  noShadow?: boolean
  offset: number
}

const Floor: React.FC<FloorProps> = (
  {
    visible = false,
    width,
    length,
    noShadow = false,
    offset = 0,
    ...otherProps
  }
) => {
  const position: [number, number, number] = [
    (width ?? 0)/2,
    (length ?? 0)/2,
    -offset
  ]
  const planeArgs: [number, number, number, number] = [
    width ?? BIG_NUM,
    length ?? BIG_NUM,
    Math.floor((width ?? 20) / 20),
    Math.floor((length ?? 20) / 20)
  ]
  if (!visible) return null
  return (
        <group {...otherProps} >
            {(width != null) && (length != null) && <mesh receiveShadow={true} position={position}>
                <planeGeometry args={planeArgs}/>
                <meshStandardMaterial wireframe={true} color={'#777'}/>
            </mesh>}
            {!noShadow && <mesh receiveShadow={true} position={position}>
                <planeGeometry args={planeArgs}/>
                <shadowMaterial opacity={0.2}/>
            </mesh>}
        </group>
  )
}

export default Floor
