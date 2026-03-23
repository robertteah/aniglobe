import { useState } from "react";
import { pb } from "@/src/lib/pocketbase";
import { useAuthStore } from "@/src/store/authStore";

export default function AuthModal({ open, onClose }) {
  const { setAuth } = useAuthStore();
  const pocketbaseEnabled = Boolean(pb.baseUrl);
  const [tab, setTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");

  if (!open) return null;

  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const clearForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    });
    setError("");
  };

  const loginWithEmail = async () => {
    if (!pocketbaseEnabled) {
      setError("PocketBase URL is not configured.");
      return;
    }
    setError("");
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await pb
        .collection("users")
        .authWithPassword(formData.username, formData.password);

      if (pb.authStore.isValid && pb.authStore.record) {
        setAuth({
          id: pb.authStore.record.id,
          email: pb.authStore.record.email,
          username: pb.authStore.record.username,
          avatar: pb.authStore.record.avatar,
          collectionId: pb.authStore.record.collectionId,
          collectionName: pb.authStore.record.collectionName,
          autoSkip: pb.authStore.record.autoSkip,
        });
        clearForm();
        onClose();
      }
    } catch (e) {
      console.error("Login error:", e);
      setError("Invalid username or password.");
    }
  };

  const signupWithEmail = async () => {
    if (!pocketbaseEnabled) {
      setError("PocketBase URL is not configured.");
      return;
    }
    setError("");
    if (
      !formData.username ||
      !formData.password ||
      !formData.email ||
      !formData.confirm_password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const user = await pb.collection("users").create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirm_password,
      });

      if (user) {
        clearForm();
        setTab("login");
      }
    } catch (e) {
      console.error("Signup error:", e);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000001] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[360px] rounded-lg bg-[#201F31] text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-semibold">{tab === "login" ? "Login" : "Signup"}</p>
          <button
            className="text-white/70 hover:text-white"
            onClick={() => {
              clearForm();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="flex gap-2 pb-4">
            <button
              className={`flex-1 rounded-md px-3 py-1 text-sm ${
                tab === "login" ? "bg-[#ffbade] text-black" : "bg-white/10"
              }`}
              onClick={() => {
                clearForm();
                setTab("login");
              }}
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-md px-3 py-1 text-sm ${
                tab === "signup" ? "bg-[#ffbade] text-black" : "bg-white/10"
              }`}
              onClick={() => {
                clearForm();
                setTab("signup");
              }}
            >
              Signup
            </button>
          </div>

          {!pocketbaseEnabled && (
            <p className="mb-2 text-xs text-yellow-300">
              PocketBase is not configured. Set `VITE_POCKETBASE_URL`.
            </p>
          )}

          {tab === "login" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/70">Email or Username</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#2D2B44] px-3 py-2 text-sm text-white outline-none"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setField("username", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/70">Password</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#2D2B44] px-3 py-2 text-sm text-white outline-none"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                className="mt-1 rounded-md bg-[#ffbade] px-3 py-2 text-sm font-semibold text-black"
                onClick={loginWithEmail}
              >
                Login
              </button>
            </div>
          )}

          {tab === "signup" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-white/70">Username</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#2D2B44] px-3 py-2 text-sm text-white outline-none"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setField("username", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/70">Email</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#2D2B44] px-3 py-2 text-sm text-white outline-none"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/70">Password</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#2D2B44] px-3 py-2 text-sm text-white outline-none"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/70">Confirm Password</label>
                <input
                  className="mt-1 w-full rounded-md border border-white/10 bg-[#2D2B44] px-3 py-2 text-sm text-white outline-none"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setField("confirm_password", e.target.value)}
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                className="mt-1 rounded-md bg-[#ffbade] px-3 py-2 text-sm font-semibold text-black"
                onClick={signupWithEmail}
              >
                Signup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
