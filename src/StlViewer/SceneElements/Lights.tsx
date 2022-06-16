import React from "react"

export interface LightsProps {
    distance: number
    offsetX?: number
    offsetY?: number
    offsetZ?: number
}

const Lights: React.FC<LightsProps> = (
    {
        offsetX=0,
        offsetY=0,
        offsetZ=0,
        distance
    }
) => {

    return (
        <>
            <ambientLight/>
            <spotLight
                castShadow
                position={[offsetX, offsetY, distance+offsetZ]}
            />
            {[
                [-distance+offsetX, offsetY, distance+offsetZ],
                [offsetX, -distance+offsetY, distance+offsetZ],
                [offsetX, distance+offsetY, offsetZ]
            ].map((position, index) => (
                <spotLight
                    key={index}
                    intensity={.4}
                    position={position as [number, number, number]}
                />
            ))}
        </>
    )
}

export default Lights
