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
