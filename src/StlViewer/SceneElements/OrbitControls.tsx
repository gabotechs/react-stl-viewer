import { EventManager, useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as React from 'react'
import { OrbitControls as StdOrbitControls } from 'three-stdlib'
import '@react-three/fiber'

export interface OrbitControlsProps extends Omit<React.ComponentProps<'primitive'>, 'object'> {}

const OrbitControls: React.FC<OrbitControlsProps> = (props) => {
  const camera = useThree((state) => state.camera)
  const controls = React.useMemo(() => new StdOrbitControls(camera), [camera])

  const gl = useThree((state) => state.gl)
  const events = useThree((state) => state.events) as EventManager<HTMLElement>
  const domElement = events.connected ?? gl.domElement

  useEffect(() => {
    controls.connect(domElement)
    return () => controls.dispose()
  })

  useFrame(() => {
    controls.update()
  }, -1)

  return <primitive object={controls} {...props}/>
}

export default OrbitControls
