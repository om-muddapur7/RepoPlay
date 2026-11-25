import type { SVGProps } from "react";

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const Sun = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" />
  <path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" />
  <path d="m19.07 4.93-1.41 1.41" /></svg>;
export const Moon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>;
export const Menu = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M4 5h16" />
  <path d="M4 12h16" />
  <path d="M4 19h16" /></svg>;
export const Check = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M20 6 9 17l-5-5" /></svg>;
export const Bolt = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
export const Lock = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
export const Layers = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
export const Github = (p: SVGProps<SVGSVGElement>) => <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54l-.02-2.08c-3.12.68-3.78-1.32-3.78-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .1 1.12 1.64 3.25.83.1-.73.39-1.23.71-1.51-2.49-.29-5.11-1.25-5.11-5.54 0-1.22.44-2.22 1.15-3-.11-.29-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.61 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.12 5.53.4.35.76 1.03.76 2.08l-.02 3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" /></svg>;
export const Globe = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="12" cy="12" r="10" />
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
  <path d="M2 12h20" /></svg>;
export const XIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} fill="currentColor" stroke="none" {...p}><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5Z" /></svg>;
export const PlayIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M8 5v14l11-7L8 5Z" /></svg>;
export const BoltIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
export const FolderIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>;
export const ReactIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><circle cx="12" cy="12" r="1.8" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></svg>;
export const CodeIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></svg>;
export const LayersIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base} {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>;
