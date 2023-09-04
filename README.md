# react-stl-viewer

React component for visualizing STLs using Three.js.

<p align="center">
    <img src="docs/demo.gif">
</p>

## Install

```shell
npm install --save react-stl-viewer
```
or
```shell
yarn add react-stl-viewer
```

## Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {StlViewer} from "react-stl-viewer";

const url = "https://storage.googleapis.com/ucloud-v3/ccab50f18fb14c91ccca300a.stl"

const style = {
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
}

function App() {
    return (
        <StlViewer
            style={style}
            orbitControls
            shadows
            url={url}
        />
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## Demo

You can see working the examples from `.storybook/stories` [here](https://gabotechs.github.io/react-stl-viewer)

## Props

| Prop                       | Type                       | Required     | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------: | :----------------------------------------------------------:                                                                                                                                |
| `url`                      | `string`                   | `true`       | url of the Stl file |
| `modelProps`               | `ModelProps`               | `false`      | 3d model properties, see below |
| `floorProps`               | `FloorProps`               | `false`      | floor properties, see below |
| `shadows`                  | `boolean`                  | `false`      | render shadows projected by the model on the ground |
| `showAxes`                 | `boolean`                  | `false`      | show x y z axis |
| `orbitControls`            | `boolean`                  | `false`      | enable camera orbit controls|
| `extraHeaders`             | `Record<string, string>`   | `false`      | custom headers for making the http query |
| `onFinishLoading`          | `(ev: ModelDimensions) => any`| `false`   | callback triggered when Stl is fully loaded |
| `onError`                  | `(err: Error) => any`      | `false`      | callback triggered when an error occurred while loading Stl|
| `canvasId`                 | `string`                   | `false`      | id of the canvas element used for rendering the model |
| `subdivide`                    | `number`            | `0`      |subdivide-level, subdivide modifier ([support by three-subdivide](https://github.com/stevinz/three-subdivide)) iterations, total passes of subdivision to apply, generally between 1 to 5, more see [`SubdivideProps`](#subdivideprops)|
The component also accepts ```<div/>``` props

## Interfaces

### ModelProps

| Prop                       | Type                       | Required     | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------: | :----------------------------------------------------------:                                                                                                                                |
| `ref`                      | `{current: ModelRef}`      | `false`      | reference of the 3d model for accessing it's properties |
| `scale`                    | `number`                   | `false`      | scale of the 3d model, defaults to 1 |
| `positionX`                | `number`                   | `false`      | x coordinate in the world of the 3d model |
| `positionY`                | `number`                   | `false`      | y coordinate in the world of the 3d model |
| `rotationX`                | `number`                   | `false`      | rotation in x axis of the model |
| `rotationY`                | `number`                   | `false`      | rotation in y axis of the model |
| `rotationY`                | `number`                   | `false`      | rotation in z axis of the model |
| `color`                    | `CSSProperties['color']`   | `false`      | color of the 3d model, defaults to "grey" |

### FloorProps
| Prop                       | Type                       | Required     | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------: | :----------------------------------------------------------:                                                                                                                                |
| `gridWidth`                | `number`                   | `false`      | if specified, a grid will be drawn in the floor with this width |
| `gridLength`               | `number`                   | `false`      | if specified, a grid will be drawn in the floor with this length |


### ModelDimensions
| Prop                       | Type                       | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------------------------------------------------------:                                                                                                                                |
| `boundingRadius`           | `number`                   | the radius of the bounding sphere of the 3d model before scaling |
| `width`                    | `number`                   | width of the 3d object |
| `height`                   | `number`                   | height of the 3d object |
| `length`                   | `number`                   | length of the 3d object |


### SubdivideProps
`react-stl-viewer` support subdivide modifier, you can smaller file sizes mesh to render smoother effects. So, why we need this? [-> more details #37](https://github.com/gabotechs/react-stl-viewer/pull/37#issuecomment-1704653068)
 

ref: [three-subdivide](https://github.com/stevinz/three-subdivide#modify)
| Prop                       | Type                       | Required | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------: | :----------------------------------------------------------:                                                                                                                                |
| `split`                   | `boolean`                 |`false`    | split coplanar faces at their shared edges before subdividing? |
| `uvSmooth`                | `boolean`                 |`false`    | smooth UV coordinates during subdivision?|
| `preserveEdges`           | `boolean`                 |`false`    | should edges / breaks in geometry be ignored during subdivision?|
| `flatOnly`                | `boolean`                |`false`    | subdivide triangles but do not apply smoothing?|
| `maxTriangles`            | `number`                  |`false`    | limits subdivision to meshes with less than this number of triangles, default is `Infinity`|

