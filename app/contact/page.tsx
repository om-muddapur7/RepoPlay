import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

const contacts = [
  ["GitHub", "Browse my projects and open an issue or discussion.", "https://github.com/om-muddapur7"],
  ["Portfolio", "See my work and get in touch.", "https://om-portfolio-plum.vercel.app/"],
  ["X", "Say hi or share what you built.", "https://x.com/Om7248"],
];

export default function Contact() {
  return (
    <main className="shell page">
      <header className="page-head">
        <span className="eyebrow">Contact</span>
        <h1>Let’s talk</h1>
        <p>Get in touch with Om Muddapur, the creator of RepoPlay.</p>
      </header>
      <ul className="grid-3">
        {contacts.map(([title, description, href]) => (
          <li key={title}>
            <a className="contact-card glass" href={href} target="_blank" rel="noopener noreferrer" style={{ height: "100%" }}>
              <h2>{title}</h2><p>{description}</p><span>Visit {title} →</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
