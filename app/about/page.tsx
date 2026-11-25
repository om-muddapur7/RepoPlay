import Link from "next/link";
import { BoltIcon, CodeIcon, FolderIcon, LayersIcon, PlayIcon, ReactIcon } from "../../components/icons";

const features = [
  { Icon: PlayIcon, color: "#2563eb", title: "Live demos", description: "Open a working deployment or generate a temporary preview from public GitHub source." },
  { Icon: BoltIcon, color: "#f59e0b", title: "Quick previews", description: "Paste a repository URL in the workspace. Each temporary preview runs for ten minutes." },
  { Icon: CodeIcon, color: "#06b6d4", title: "Static websites", description: "Preview sites built with HTML, CSS, and JavaScript that have a root index.html." },
  { Icon: ReactIcon, color: "#10b981", title: "React apps", description: "Try compatible Vite and Create React App projects directly from their public source." },
  { Icon: LayersIcon, color: "#8b5cf6", title: "Frontend demos", description: "Open supported frontend clients from full-stack repositories in frontend mode." },
  { Icon: FolderIcon, color: "#ef4444", title: "Private gallery", description: "Revisit successfully rendered previews from your account when your plan includes a gallery." },
];

export default function About() {
  return (
    <main className="shell reference-page">
      <header className="reference-heading">
        <h1>Explore what RepoPlay can do</h1>
        <p>Try a public GitHub project in your browser. RepoPlay opens working deployments and builds compatible frontends from source.</p>
      </header>
      <ul className="reference-features">
        {features.map(({ Icon, color, title, description }) => (
          <li key={title} className="tool-card">
            <span className="tool-icon" style={{ backgroundColor: color }}><Icon /></span>
            <h2>{title}</h2><p>{description}</p>
          </li>
        ))}
      </ul>
      <div className="center"><Link className="button" href="/workspace">Open workspace</Link></div>
    </main>
  );
}
