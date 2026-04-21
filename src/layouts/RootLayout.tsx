// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
          © 2025 Eventify. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
