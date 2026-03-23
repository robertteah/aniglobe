import { useEffect } from "react";
import { pb } from "@/src/lib/pocketbase";
import { useAuthStore } from "@/src/store/authStore";

export default function AuthBootstrap() {
  const { setAuth, clearAuth, setIsRefreshing } = useAuthStore();

  useEffect(() => {
    const refreshAuth = async () => {
      const storedAuth = localStorage.getItem("pocketbase_auth");
      const authToken = storedAuth ? JSON.parse(storedAuth) : null;
      if (!authToken) {
        setIsRefreshing(false);
        return;
      }

      try {
        const user = await pb.collection("users").authRefresh();
        if (user?.record) {
          setAuth({
            id: user.record.id,
            email: user.record.email,
            username: user.record.username,
            avatar: user.record.avatar,
            collectionId: user.record.collectionId,
            collectionName: user.record.collectionName,
            autoSkip: user.record.autoSkip,
          });
        }
      } catch (e) {
        console.error("Auth refresh error:", e);
        localStorage.removeItem("pocketbase_auth");
        clearAuth();
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshAuth();
  }, [setAuth, clearAuth, setIsRefreshing]);

  return null;
}
