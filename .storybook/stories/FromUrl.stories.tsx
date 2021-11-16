import React, { FC, useRef } from "react";
import { StlViewer, StlViewerProps } from "../../src";
import { ComponentMeta } from "@storybook/react";
import { ModelRef } from "../../src/StlViewer/SceneSetup";

function download(filename: string, blob: Blob) {
    const element = document.createElement('a');
    element.setAttribute('download', filename);
    element.style.display = 'none';
    element.href = URL.createObjectURL(blob)
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

const url = "https://storage.googleapis.com/ucloud-v3/61575ca49d8a1777fa431395.stl"
const url2 = "https://storage.googleapis.com/ucloud-v3/2272dfa00d58a59dae26a399.stl"

function FromUrl(props: Omit<StlViewerProps, "url">) {
    const ref = useRef<ModelRef>()

    return (
        <>
            <StlViewer
                url={url}
                style={{
                    position: "absolute",
                    top: '0vh',
                    left: '0vw',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: "white"
                }}
                shadows
                showAxis
                orbitControls
                modelProps={{
                    positionX: 0,
                    positionY: 0,
                    scale: 1,
                    rotationX: Math.PI/2,
                    color: "#008675",
                    ref
                }}
                floorProps={{
                    gridWidth: 200
                }}
                onFinishLoading={console.log}
                {...props}
            />
            <button
                style={{
                    position: "absolute",
                    top: 20,
                    left: 100,
                }}
                onClick={() => {
                if (ref.current) {
                    const file = ref.current.save()
                    download("exported.stl", file)
                }
            }}>
                download
            </button>
        </>

    );
}

export const Primary = FromUrl.bind({})

export default {
    component: StlViewer,
    title: "StlViewer from url",
} as ComponentMeta<FC<StlViewerProps>>
