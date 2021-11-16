import { CSSProperties, FC, useCallback, useState } from "react";
import { StlViewer, StlViewerProps } from "../../src";
import { ComponentMeta } from "@storybook/react";
import React from "react";

const style: CSSProperties = {
    position: "absolute",
    top: '0vh',
    left: '0vw',
    width: '100vw',
    height: '100vh',
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

function FromUrl(props: Omit<StlViewerProps, "url">) {
    const [file, setFile] = useState<File>()

    const preventDefault = useCallback((e: React.DragEvent<any>) => {
        e.preventDefault()
    }, [])

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        console.log("file dropped")
        setFile(e.dataTransfer.files[0])
    }, [])

    const extraProps = {onDragOver: preventDefault, onDragEnter: preventDefault, onDrop}

    return (
        <>
            {file && <StlViewer
                url={URL.createObjectURL(file)}
                style={style}
                shadows
                modelProps={{
                    color: "#008675"
                }}
                {...extraProps}
                {...props}
            />}
            {!file && <div style={style} {...extraProps}>
                <h4>drop here</h4>
            </div>}
        </>

    );
}

export const Primary = FromUrl.bind({})

export default {
    component: StlViewer,
    title: "StlViewer from dropped file",
} as ComponentMeta<FC<StlViewerProps>>
