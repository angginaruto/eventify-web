// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { logoutApi } from "@/services/auth.service";

export default function Navbar() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      clearUser();
      navigate("/login");
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a12]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            
            <span className="text-lg font-semibold text-white">
              Eventify
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Browse Events
            </Link>

            {isAuthenticated && user?.role === "ORGANIZER" && (
              <>
                <Link
                  to="/organizer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/organizer/events"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  My Events
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                to="/transactions"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                My Tickets
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-violet-500 text-white px-4 py-2 rounded-lg hover:bg-violet-400 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="text-sm text-slate-200 font-medium hover:text-violet-300"
                >
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-500 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}