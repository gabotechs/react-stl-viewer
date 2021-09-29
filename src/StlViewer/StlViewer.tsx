import React, { HTMLProps, useMemo } from "react"
import { Canvas } from "@react-three/fiber";
import StlModel, { StlModelProps } from "./StlModel";
import ErrorBoundary from "./ErrorBoundary";
import { PCFSoftShadowMap } from "three";

export interface StlViewerProps extends
    Omit<HTMLProps<HTMLDivElement>, "color" | "onError">,
    Omit<StlModelProps, "url"> {
    url?: string
    file?: File
    onError?(err: Error): void,
    canvasId?: string
}

const StlViewer: React.FC<StlViewerProps> = (
    {
        url: _url,
        file,
        color,
        children,
        onError,
        extraHeaders,
        onFinishLoading,
        canvasId,
        shadows,
        ...otherProps
    }
) => {

    const url = useMemo((): string => {
        if (_url) return _url
        if (file) return URL.createObjectURL(file)
        throw new Error("url or file must be defined")
    }, [_url, file])

    const modelProps: StlModelProps = {
        url,
        color,
        extraHeaders,
        onFinishLoading,
        shadows
    }

    return (
        <div {...otherProps}>
            <ErrorBoundary onError={onError}>
                <React.Suspense fallback={null}>
                    <Canvas
                        shadows
                        gl={{preserveDrawingBuffer: true, shadowMapType: PCFSoftShadowMap, antialias: true}}
                        id={canvasId}
                        style={{width: '100%', height: '100%'}}
                    >
                        <StlModel {...modelProps}/>
                    </Canvas>
                </React.Suspense>
            </ErrorBoundary>
            {children}
        </div>
    )
}

export default StlViewer
