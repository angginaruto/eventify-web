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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 p-3 space-y-1">
              {sidebarLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
