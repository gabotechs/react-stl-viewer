import React, { HTMLProps, useMemo } from "react"
import { Canvas } from "@react-three/fiber";
import StlModel, { StlModelProps } from "./StlModel";
import ErrorBoundary from "./ErrorBoundary";

export interface StlViewerProps extends
    Omit<HTMLProps<HTMLDivElement>, "color" | "onError">,
    Omit<StlModelProps, "url"> {
    url?: string
    file?: File
    onError?(err: Error): void
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
        onFinishLoading
    }

    return (
        <div {...otherProps}>
            <ErrorBoundary onError={onError}>
                <React.Suspense fallback={null}>
                    <Canvas style={{width: '100%', height: '100%'}}>
                        <StlModel {...modelProps}/>
                    </Canvas>
                </React.Suspense>
            </ErrorBoundary>
            {children}
        </div>
    )
}

export default StlViewer
