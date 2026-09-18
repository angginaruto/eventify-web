// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

const exploreLinks = [
  { label: "Music Concerts", href: "#" },
  { label: "Sports Matches", href: "#" },
  { label: "Comedy Venues", href: "#" },
  { label: "Exclusive Deals", href: "#" },
];

const partnerLinks = [
  { label: "Register Venue", href: "#" },
  { label: "Host an Event", href: "#" },
  { label: "API Scanners", href: "#" },
  { label: "Developer Docs", href: "#" },
];

const supportLinks = [
  { label: "Ticket Refund Help", href: "#" },
  { label: "Entry Policies", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-[#0a0a12] border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-white">Eventivy</span>
              </div>
              <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-xs">
                Empowering fans with smooth, trustworthy entry access to live
                events. No checkout scams, just raw experiences.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {[
                  { label: "Facebook", icon: "facebook" },
                  { label: "Twitter", icon: "twitter" },
                  { label: "Instagram", icon: "instagram" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Explore</h3>
              <ul className="space-y-3">
                {exploreLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partners */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Partners</h3>
              <ul className="space-y-3">
                {partnerLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3">
                {supportLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              © 2025 Eventivy Technologies Inc. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ShieldIcon />
              PCI-DSS Security Compliant Network
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46H16.5V4.35A20 20 0 0 0 14.3 4.2c-2.2 0-3.8 1.34-3.8 3.8v2.5H8v3h2.5V21h3Z" />
      </svg>
    );
  }
  if (name === "twitter") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.5 1 4 4 0 0 0-6.9 3.6A11.4 11.4 0 0 1 3.9 4.6a4 4 0 0 0 1.3 5.4 4 4 0 0 1-1.8-.5v.1a4 4 0 0 0 3.2 3.9c-.5.2-1.1.2-1.7.1a4 4 0 0 0 3.8 2.8A8.1 8.1 0 0 1 2 18.4a11.4 11.4 0 0 0 6.2 1.8c7.4 0 11.5-6.2 11.5-11.5v-.5c.8-.6 1.5-1.3 2-2.1Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 shrink-0">
      <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" />
    </svg>
  );
}