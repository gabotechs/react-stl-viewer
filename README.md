# react-gcode-viewer

React component for visualizing GCodes using Three.js.

<p align="center">
    <img src="docs/demo.gif">
</p>

## Install

```shell
npm install --save react-stl-viewer
```
or
```shell
yarn install react-stl-viewer
```

## Usage

```js
import React from 'react';
import ReactDOM from 'react-dom';
import {GCodeViewer} from "react-gcode-viewer";

const url = "https://storage.googleapis.com/ucloud-v3/6127a7f9aa32f718b8c1ab4f.gcode"

const style = {
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
}

function App() {
    return (
        <GCodeViewer
            style={style}
            url={url}
        />
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## Props

| Prop                       | Type                       | Required     | Notes                                                                                                                                                                                       |
| ----------------------     | :------------------------: | :----------: | :----------------------------------------------------------:                                                                                                                                |
| `url`                      | `string`                   | `?true`      | url of the GCode file, required if no "file" parameter is specified |
| `file`                     | `string or File`           | `?true`      | string or File object, required if no "url" parameter is specified |
| `quality`                  | `number`                   | `false`      | (default 1) number between 0 and 1 specifying the render quality, for larger models it's recommended to lower this number, as it consumes a lot of resources |
| `visible`                  | `number`                   | `false`      | (default 1) number between 0 and 1 specifying the percentage of visible layers |
| `layerColor`               | `string`                   | `false`      | (default "grey") layer color |
| `topLayerColor`            | `string`                   | `false`      | (default "hotpink") top layer color |
| `reqOptions`               | `RequestInit`              | `false`      | fetch options for customizing the http query made for retrieving the GCode file, only valid if "url" is specified |
| `onProgress`               | `(p: GCodeParseProgress) => any` | `false`| callback triggered on parsing progress |
| `onFinishLoading`          | `(p: GCodeParseProgress) => any` | `false`| callback triggered when GCode is fully loaded |
| `onError`                  | `(err: Error) => any`      | `false`      | callback triggered when an error occurred while loading GCode|

The component also accepts ```<div/>``` props
