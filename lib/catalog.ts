export const categories = ["Developer tools", "Productivity", "Data & visualization"] as const;
type Category = (typeof categories)[number];

export interface Project {
  slug: string;
  title: string;
  description: string;
  category: Category;
  technology: string;
  author: string;
  source: string;
  demo: string;
  theme: "blue" | "purple" | "green";
}

export const projects: Project[] = [
  {
    slug: "typescript-playground",
    title: "TypeScript Playground",
    description: "Experiment with TypeScript in the browser and see how your code compiles to JavaScript.",
    category: "Developer tools",
    technology: "TypeScript",
    author: "Microsoft",
    source: "https://github.com/microsoft/TypeScript-Website",
    demo: "https://www.typescriptlang.org/play/",
    theme: "blue",
  },
  {
    slug: "excalidraw",
    title: "Excalidraw",
    description: "Sketch ideas, diagrams, and workflows on a hand-drawn virtual whiteboard.",
    category: "Productivity",
    technology: "React",
    author: "Excalidraw",
    source: "https://github.com/excalidraw/excalidraw",
    demo: "https://excalidraw.com/",
    theme: "purple",
  },
  {
    slug: "vega-editor",
    title: "Vega Editor",
    description: "Edit a JSON visualization specification and see the chart update alongside it.",
    category: "Data & visualization",
    technology: "Vega",
    author: "Vega",
    source: "https://github.com/vega/editor",
    demo: "https://vega.github.io/editor/",
    theme: "green",
  },
];
