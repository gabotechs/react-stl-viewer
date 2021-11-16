import React, { useEffect } from "react"
import { PerspectiveCamera } from "@react-three/drei";
import { PerspectiveCameraProps, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

export interface CameraProps extends Partial<PerspectiveCameraProps> {
}

const Camera: React.FC<CameraProps> = (
    {
        ...otherProps
    }
) => {
    const {camera} = useThree()
    useEffect(() => {
        camera.up.applyAxisAngle(new Vector3(1, 0, 0), Math.PI/2)
    }, [camera])

    return (
        <PerspectiveCamera
            makeDefault
            near={1}
            far={1000}
            {...otherProps}
        />
    )
}

export default Camera
