import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pb } from "@/src/lib/pocketbase";
import { useAuthStore } from "@/src/store/authStore";
import AuthModal from "./AuthModal";

export default function AuthButton() {
  const { auth, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const logout = () => {
    pb.authStore.clear();
    localStorage.removeItem("pocketbase_auth");
    clearAuth();
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!auth) {
    return (
      <>
        <button
          className="rounded-md bg-[#ffbade] px-3 py-1 text-sm font-semibold text-black hover:bg-[#ff9fcf]"
          onClick={() => setOpen(true)}
        >
          Login
        </button>
        <AuthModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      <button
        className="flex items-center gap-2 rounded-md bg-[#ffbade] px-3 py-1 text-black hover:bg-[#ff9fcf]"
        onClick={() => navigate("/library")}
        type="button"
      >
        <div className="h-6 w-6 overflow-hidden rounded-full bg-black/10">
          {auth.avatar ? (
            <img
              src={`${pb.baseUrl}/api/files/${auth.collectionId}/${auth.id}/${auth.avatar}`}
              alt={auth.username || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-black/70">
              {auth.username?.slice(0, 2)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <span className="text-xs font-semibold text-black">
          {auth.username || auth.email}
        </span>
      </button>
      <button
        className="rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
        onClick={() => setMenuOpen((val) => !val)}
        type="button"
        aria-label="Open user menu"
      >
        ▾
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-10 w-44 rounded-lg bg-[#2B2A3C] border border-white/10 shadow-lg">
          <Link
            to="/library"
            className="block px-4 py-2 text-sm text-white hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            My List
          </Link>
          <button
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
            onClick={logout}
            type="button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
