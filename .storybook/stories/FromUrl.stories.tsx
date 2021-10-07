import { FC } from "react";
import { StlViewer, StlViewerProps } from "../../src";
import { ComponentMeta } from "@storybook/react";
import React from "react";

const url = "https://storage.googleapis.com/ucloud-v3/61575ca49d8a1777fa431395.stl"
const url2 = "https://storage.googleapis.com/ucloud-v3/2272dfa00d58a59dae26a399.stl"

function FromUrl(props: Omit<StlViewerProps, "url">) {
    return (
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
            color={"#008675"}
            onFinishLoading={console.log}
        />
    );
}

export const Primary = FromUrl.bind({})

export default {
    component: StlViewer,
    title: "StlViewer from url",
} as ComponentMeta<FC<StlViewerProps>>
