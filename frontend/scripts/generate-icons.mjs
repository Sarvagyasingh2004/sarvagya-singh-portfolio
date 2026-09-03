// Regenerates public/images/tech/*.svg from the simple-icons package, so brand
// paths stay accurate and update with the dependency. Run: npm run icons
import * as si from "simple-icons";
import { mkdirSync, writeFileSync } from "node:fs";

const WANT = [
  ["siTypescript", "TypeScript"], ["siJavascript", "JavaScript"],
  ["siPython", "Python"], ["siNodedotjs", "Node.js"], ["siExpress", "Express"],
  ["siReact", "React"], ["siRedux", "Redux"], ["siNextdotjs", "Next.js"],
  ["siPostgresql", "PostgreSQL"], ["siMysql", "MySQL"], ["siMongodb", "MongoDB"],
  ["siRedis", "Redis"], ["siRabbitmq", "RabbitMQ"], ["siDocker", "Docker"],
  ["siSocketdotio", "Socket.IO"], ["siNginx", "Nginx"], ["siGit", "Git"],
  ["siGithubactions", "GitHub Actions"], ["siLinux", "Linux"],
  ["siThreedotjs", "Three.js"], ["siTailwindcss", "Tailwind CSS"],
];

const dir = "public/images/tech";
mkdirSync(dir, { recursive: true });

let n = 0;
const missing = [];
for (const [key, label] of WANT) {
  const icon = si[key];
  if (!icon) { missing.push(key); continue; }
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  writeFileSync(
    `${dir}/${slug}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff"><title>${label}</title><path d="${icon.path}"/></svg>`
  );
  n++;
}

console.log(`generated ${n} icons in ${dir}`);
if (missing.length) console.warn(`not in simple-icons: ${missing.join(", ")}`);
// Note: AWS was removed from simple-icons over trademark policy — there is
// deliberately no AWS mark here.
