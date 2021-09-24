import React, { HTMLProps } from "react"
import { Canvas } from "@react-three/fiber";
import StlModel, { StlModelProps } from "./StlModel";

export interface StlViewerProps extends
    Omit<HTMLProps<HTMLDivElement>, "color">,
    StlModelProps {
}

const StlViewer: React.FC<StlViewerProps> = (
    {
        url,
        color,
        children,
        ...otherProps
    }
) => {

    const modelProps: StlModelProps = {
        url,
        color
    }

    return (
        <div {...otherProps}>
            <React.Suspense fallback={null}>
                <Canvas style={{width: '100%', height: '100%'}}>
                    <StlModel {...modelProps}/>
                </Canvas>
            </React.Suspense>
            {children}
        </div>
    )
}

export default StlViewer
