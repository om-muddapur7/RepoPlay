import type { Project } from "../lib/catalog";

export function ProjectArt({ theme }: { theme: Project["theme"] }) {
  return (
    <div className={`project-art ${theme}`} aria-hidden="true">
      <div className="mock-window">
        <div className="mock-toolbar"><i /><i /><i /></div>
        {theme === "blue" && (
          <div className="code-sample">
            <div><b>const</b> project = {"{"}</div>
            <div>　 name: <em>"RepoPlay"</em>,</div>
            <div>　 interactive: <b>true</b></div>
            <div>{"}"};</div>
          </div>
        )}
        {theme === "purple" && (
          <div className="diagram"><span>Idea</span><i /><span>Sketch</span><i /><span>Share</span></div>
        )}
        {theme === "green" && (
          <div className="chart"><i /><i /><i /><i /><i /><i /><i /></div>
        )}
      </div>
    </div>
  );
}
