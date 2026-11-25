"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu } from "./icons";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/workspace", label: "Workspace" },
  { href: "/plans", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="shell">
        <nav className="nav glass" aria-label="Main navigation">
          <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">R</span>RepoPlay</Link>
          <div className="nav-links" data-open={open} onClick={() => setOpen(false)}>
            {links.map(link => (
              <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>
            ))}
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <Show when="signed-out">
              <SignInButton mode="modal"><button className="ghost-button small hide-sm" type="button">Sign in</button></SignInButton>
              <SignUpButton mode="modal"><button className="button small" type="button">Get started</button></SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton userProfileMode="navigation" userProfileUrl="/profile" />
            </Show>
            <button className="icon-button menu-toggle" type="button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(value => !value)}><Menu /></button>
          </div>
        </nav>
      </div>
    </header>
  );
}
