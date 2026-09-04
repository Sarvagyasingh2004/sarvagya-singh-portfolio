# Adding a tech logo to the constellation

One edit. Append to `techStackIcons` in `frontend/constants/index.js`:

```js
{
  name: "Express",                              // label under the model
  modelPath: "/models/express-transformed.glb", // file in public/models/
  scale: 1,                                     // tune until it fills the box
  rotation: [0, 0, 0],                          // [x, y, z] radians
},
```

Nothing else changes. Specifically, these all derive from the array at runtime:

- **the wire** - one per node, geometry measured from the live DOM
- **the arc lift** - each node's vertical offset is computed from its distance
  to the centre, so the arc reshapes itself for any count
- **the animation** - the timeline targets every `.constellation-node` and
  `.constellation-wire` present, so new entries join the draw automatically
- **the WebGL context** - all models share ONE canvas via drei `<View>`, so
  adding logos does not add contexts

Verified with 7 entries: 7 nodes, 7 wires, arc lifts
`3.40 2.27 1.13 0.00 1.13 2.27 3.40`, still 3 canvases total.

## Getting the GLB

`gltf-transform` or `gltfjsx` to optimise, then drop it in `public/models/`.
Keep files small - each one is downloaded on the client.

## Tuning `scale`

The models are drawn at wildly different intrinsic sizes. Current values range
from `0.05` (three.js) to `5` (node). Set it so the model fills roughly 80% of
its box without touching the edges, then check the widest axis is not clipped.

## Note on repeated paths

Two entries may point at the same `.glb`. `TechIcon` clones the cached scene
per instance, because `useGLTF` returns the same object for a given path and a
three.js Object3D can only belong to one scene graph at a time - without the
clone, the second card silently steals the model and the first renders empty.
