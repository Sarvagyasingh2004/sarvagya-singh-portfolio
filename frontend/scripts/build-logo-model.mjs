/**
 * Extrude one of the site's tech SVGs into a GLB for the skills constellation.
 *
 *   node scripts/build-logo-model.mjs typescript
 *   node scripts/build-logo-model.mjs rabbitmq rabbitmq-extruded.glb
 *
 * The constellation renders GLTF models, and the site only ever had five —
 * which is how a Python logo ended up representing a stack with no Python in
 * it. Building them from the same simple-icons SVGs the marquee already uses
 * makes a new logo a build step rather than a hunt for a matching 3D asset.
 *
 * Needs @xmldom/xmldom (a devDependency): three's SVGLoader wants a DOMParser,
 * and Node has none.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOMParser } from "@xmldom/xmldom";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

globalThis.DOMParser = DOMParser;

// GLTFExporter reads its assembled Blob through a FileReader, which Node has no
// equivalent of. Node does have Blob, and the exporter only calls
// readAsArrayBuffer + onloadend, so that pair is all this has to provide.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "public/images/tech");
const OUT = join(root, "public/models");

// Sized so the constellation's per-model `scale` stays a round number instead
// of the magic constants the hand-authored models need.
const TARGET = 1.6;

const slug = process.argv[2];
if (!slug) {
  console.error("usage: node scripts/build-logo-model.mjs <slug> [outfile.glb]");
  process.exit(1);
}
const outName = process.argv[3] || `${slug}-extruded.glb`;

const data = new SVGLoader().parse(readFileSync(join(SRC, `${slug}.svg`), "utf8"));
const staged = new THREE.Group();

for (const path of data.paths) {
  // No convertSRGBToLinear here. three manages colour space by default since
  // r152, so SVGLoader has already converted the SVG's fill into the linear
  // working space — converting again halved TypeScript's blue and took the
  // green out of RabbitMQ's orange, which rendered red instead.
  const colour = path.color ? path.color.clone() : new THREE.Color("#8f9bb0");
  const material = new THREE.MeshStandardMaterial({
    color: colour,
    metalness: 0.05,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });
  for (const shape of SVGLoader.createShapes(path)) {
    staged.add(
      new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth: 9,
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.4,
          bevelSegments: 1,
          curveSegments: 6,
        }),
        material
      )
    );
  }
}

// SVG's Y axis points down; three's points up.
staged.scale.y = -1;
staged.updateMatrixWorld(true);

const box = new THREE.Box3().setFromObject(staged);
const size = box.getSize(new THREE.Vector3());
const centre = box.getCenter(new THREE.Vector3());
const k = TARGET / Math.max(size.x, size.y, size.z);

// Bake the flip, centring and scale into the geometry. The loader clones the
// scene and drives rotation from the group it mounts, so a transform left on a
// parent node would fight it.
const out = new THREE.Group();
staged.traverse((o) => {
  if (!o.isMesh) return;
  const g = o.geometry.clone();
  g.applyMatrix4(o.matrixWorld);
  g.translate(-centre.x, -centre.y, -centre.z);
  g.scale(k, k, k);
  // ExtrudeGeometry emits every triangle with its own three vertices, plus a UV
  // set nothing samples. Welding and dropping those is where nearly all of the
  // file size goes — 670KB became 139KB on the TypeScript mark.
  g.deleteAttribute("uv");
  const welded = mergeVertices(g, 1e-4);
  welded.computeVertexNormals();
  out.add(new THREE.Mesh(welded, o.material));
});

const glb = await new Promise((resolve, reject) =>
  new GLTFExporter().parse(out, resolve, reject, { binary: true, onlyVisible: true })
);
writeFileSync(join(OUT, outName), Buffer.from(glb));

let tris = 0;
out.traverse((o) => {
  if (o.isMesh) tris += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
});
console.log(
  `${outName}  ${(Buffer.from(glb).length / 1024).toFixed(0)} KB  ${tris.toFixed(0)} triangles`
);
