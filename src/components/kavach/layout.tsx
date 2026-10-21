"use client";

import { useState } from "react";
import { useApp, type View } from "@/store/app";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, Sun, Building2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type NavItem = { label: string; view: View; anchor?: string };

const NAV: NavItem[] = [
  { label: "Home", view: "home" },
  { label: "Projects", view: "projects" },
  { label: "How It Works", view: "home", anchor: "how-it-works" },
  { label: "For Owners", view: "home", anchor: "owners" },
  { label: "Safety", view: "safety" },
  { label: "Partners", view: "home", anchor: "partners" },
];

function goHomeSection(sectionId: string) {
  useApp.getState().setView("home");
  requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  });
}

export function Navbar() {
  const { view, setView, user, setAuthOpen } = useApp();
  const [open, setOpen] = useState(false);

  const go = (item: NavItem) => {
    setOpen(false);
    if (item.anchor) goHomeSection(item.anchor);
    else setView(item.view);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-900/10 bg-background/90 backdrop-blur-md kg-no-print">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <button onClick={() => go({ label: "Home", view: "home" })} className="flex items-center rounded-lg focus-visible:ring-2 focus-visible:ring-ring" aria-label="GridKavach home">
          <Logo />
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV.map((item, i) => {
            const active = view === item.view && !item.anchor;
            return (
              <button
                key={i}
                onClick={() => go(item)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground",
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" onClick={() => setView("dashboard")} className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setAuthOpen(true, "login")}>
              Sign in
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setView("contact")}
            className="hidden gap-2 rounded-full border-blue-300 text-blue-900 hover:bg-blue-50 lg:inline-flex"
          >
            <Building2 className="h-4 w-4" /> List a project
          </Button>
          <Button onClick={() => setView("projects")} className="gap-2 rounded-full bg-primary hover:bg-primary/90">
            <Sun className="h-4 w-4" /> Start Investing
          </Button>
        </div>

        {/* mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Button size="sm" variant="secondary" onClick={() => setView("dashboard")} className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> <span className="sr-only sm:not-sr-only">Dashboard</span>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setAuthOpen(true, "login")}>
              Sign in
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {NAV.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => go(item)}
                    className="rounded-lg px-3 py-2.5 text-left text-base font-medium hover:bg-secondary"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="my-2 h-px bg-border" />
                <Button
                  onClick={() => {
                    setOpen(false);
                    setView("projects");
                  }}
                  className="mt-1 gap-2"
                >
                  <Sun className="h-4 w-4" /> Start Investing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setView("contact");
                  }}
                  className="mt-2 gap-2"
                >
                  <Building2 className="h-4 w-4" /> List a project
                </Button>
                <p className="mt-4 px-3 text-xs text-muted-foreground">
                  Operated by {BRAND.shortLegal}
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const setView = useApp((s) => s.setView);
  return (
    <footer className="mt-auto kg-no-print border-t border-blue-900/10 bg-leaf-dark text-blue-50/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-blue-100/75">
            {BRAND.tagline}. A digital solar marketplace operated by {BRAND.shortLegal}: verified rooftop projects
            are listed by their owners, funded by investors into project escrow accounts, and executed, monitored and
            maintained (AMC) end-to-end by GridKavach. Credits adjust straight onto your electricity bill, and every
            agreement is signed paperlessly.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-blue-100/55">
            Operated by {BRAND.legalName}, {BRAND.registeredOffice}.
            <br />
            Digital records governed by the Information Technology Act, 2000.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Platform</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><button className="hover:text-white" onClick={() => setView("projects")}>Live Projects</button></li>
            <li><button className="hover:text-white" onClick={() => goHomeSection("calculator")}>Savings Calculator</button></li>
            <li><button className="hover:text-white" onClick={() => goHomeSection("how-it-works")}>How It Works</button></li>
            <li><button className="hover:text-white" onClick={() => goHomeSection("owners")}>For Project Owners</button></li>
            <li><button className="hover:text-white" onClick={() => setView("safety")}>Safety</button></li>
            <li><button className="hover:text-white" onClick={() => goHomeSection("partners")}>Solar Partners</button></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><button className="hover:text-white" onClick={() => setView("about")}>About Us</button></li>
            <li><button className="hover:text-white" onClick={() => setView("contact")}>Contact</button></li>
            <li><button className="hover:text-white" onClick={() => setView("terms")}>Terms of Use</button></li>
            <li><button className="hover:text-white" onClick={() => setView("privacy")}>Privacy Policy</button></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-blue-100/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} {BRAND.legalName}. All rights reserved.</span>
          <span>{BRAND.domain} · {BRAND.supportEmail}</span>
        </div>
      </div>
    </footer>
  );
}
