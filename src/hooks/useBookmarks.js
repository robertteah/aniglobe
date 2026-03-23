import { useEffect, useState } from "react";
import { pb } from "@/src/lib/pocketbase";
import { useAuthStore } from "@/src/store/authStore";

export default function useBookmarks({
  animeID,
  status,
  page,
  per_page,
  populate = true,
} = {}) {
  const { auth } = useAuthStore();
  const [bookmarks, setBookmarks] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const filterParts = [];
  if (animeID) filterParts.push(`animeId='${animeID}'`);
  if (status) {
    if (status === "plan_to_watch") {
      filterParts.push("(status='plan_to_watch' || status='plan to watch')");
    } else if (status === "on_hold") {
      filterParts.push("(status='on_hold' || status='on hold')");
    } else {
      filterParts.push(`status='${status}'`);
    }
  }
  const filters = filterParts.join(" && ");

  useEffect(() => {
    if (!populate || !auth) {
      setBookmarks(null);
      setTotalPages(0);
      setIsLoading(false);
      return;
    }

    const getBookmarks = async () => {
      try {
        setIsLoading(true);
        const res = await pb.collection("bookmarks").getList(page || 1, per_page || 20, {
          filter: filters,
          expand: "watchHistory",
          sort: "-updated",
        });

        if (res.totalItems > 0) {
          setTotalPages(res.totalPages);
          setBookmarks(res.items);
        } else {
          setBookmarks(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getBookmarks();
  }, [animeID, status, page, per_page, filters, auth, populate]);

  const createOrUpdateBookMark = async (
    animeID,
    animeTitle,
    animeThumbnail,
    status,
    showToast = false
  ) => {
    if (!auth) return null;

    try {
      const res = await pb.collection("bookmarks").getList(1, 1, {
        filter: `animeId='${animeID}'`,
      });

      if (res.totalItems > 0) {
        if (res.items[0].status === status) {
          return res.items[0].id;
        }

        const updated = await pb.collection("bookmarks").update(res.items[0].id, {
          status,
        });

        return updated.id;
      }

      const created = await pb.collection("bookmarks").create({
        user: auth.id,
        animeId: animeID,
        animeTitle,
        thumbnail: animeThumbnail,
        status,
      });

      return created.id;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const syncWatchProgress = async (bookmarkId, watchedRecordId, episodeData) => {
    if (!pb.authStore.isValid || !bookmarkId || !auth) return watchedRecordId;

    const dataToSave = {
      user: auth.id,
      episodeId: episodeData.episodeId,
      episodeNumber: episodeData.episodeNumber,
      current: Math.round(episodeData.current),
      timestamp: Math.round(episodeData.duration),
    };

    try {
      if (watchedRecordId) {
        await pb.collection("watched").update(watchedRecordId, dataToSave);
        return watchedRecordId;
      }

      const newWatchedRecord = await pb.collection("watched").create(dataToSave);

      try {
        await pb.collection("bookmarks").update(bookmarkId, {
          "watchHistory+": newWatchedRecord.id,
        });
      } catch (error) {
        console.error("Error updating bookmark with new watch record:", error);
        return null;
      }

      return newWatchedRecord.id;
    } catch (error) {
      console.error("Error syncing watch progress:", error);
      return watchedRecordId;
    }
  };

  return {
    bookmarks,
    syncWatchProgress,
    createOrUpdateBookMark,
    totalPages,
    isLoading,
  };
}
