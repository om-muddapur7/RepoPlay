const contacts = [
  ["GitHub", "Browse my projects and reach me on GitHub.", "https://github.com/om-muddapur7"],
  ["Portfolio", "See my work and contact information.", "https://om-portfolio-plum.vercel.app/"],
  ["X", "Find me on X.", "https://x.com/Om7248"],
];

export default function Contact() {
  return (
    <main className="shell studio nest-contact">
      <header><h1>Contact <span className="accent">us</span></h1><p>Get in touch with Om Muddapur, the creator of RepoPlay.</p></header>
      <ul className="landing-grid">
        {contacts.map(([title, description, href]) => (
          <li className="landing-card" key={title}>
            <h2>{title}</h2><p>{description}</p>
            <a href={href} rel="noopener noreferrer" target="_blank">Visit {title} ↗</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
