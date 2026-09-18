// src/layouts/OrganizerLayout.tsx
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "@/components/Navbar";

const sidebarLinks = [
  { to: "/organizer", label: "Dashboard", end: true },
  { to: "/organizer/events", label: "My Events" },
  { to: "/organizer/events/create", label: "Create Event" },
];

export default function OrganizerLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a12]">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 px-4 sm:px-6 py-8">
          <nav className="bg-[#12121e] rounded-xl border border-white/10 p-3 space-y-1 sticky top-6">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-violet-500/15 text-violet-300 font-medium"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content — pages manage their own bg/padding/max-width */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}