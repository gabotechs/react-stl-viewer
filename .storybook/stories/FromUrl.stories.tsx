import React, { FC, useRef, useState } from "react";
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
    const [rotationX, setRotationX] = useState(0)
    const [rotationY, setRotationY] = useState(0)
    const [rotationZ, setRotationZ] = useState(0)


    return (
        <>
            <StlViewer
                url={url2}
                style={{
                    position: "absolute",
                    top: '0vh',
                    left: '0vw',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: "white"
                }}
                shadows
                showAxes
                orbitControls
                modelProps={{
                    positionX: 150,
                    positionY: 150,
                    rotationX,
                    rotationY,
                    rotationZ,
                    scale: 1,
                    color: "#008675",
                    ref
                }}
                floorProps={{
                    gridWidth: 300
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
            {[
                ["rotate x", setRotationX] as const,
                ["rotate y", setRotationY] as const,
                ["rotate z", setRotationZ] as const
            ].map(([text, setRotation], index) => (
                <button
                    key={index}
                    style={{
                        position: "absolute",
                        top: 50+30*index,
                        left: 100,
                    }}
                    onClick={() => setRotation(prev => prev + 15/180*Math.PI)}
                >
                    {text}
                </button>
            ))}
        </>

    );
}

export const Primary = FromUrl.bind({})

export default {
    component: StlViewer,
    title: "StlViewer from url",
} as ComponentMeta<FC<StlViewerProps>>
