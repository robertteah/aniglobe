import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useBookmarks from "@/src/hooks/useBookmarks";
import { useAuthStore } from "@/src/store/authStore";

const STATUS_TABS = [
  { label: "Watching", value: "watching" },
  { label: "Completed", value: "completed" },
  { label: "Plan to watch", value: "plan_to_watch" },
  { label: "On hold", value: "on_hold" },
  { label: "Dropped", value: "dropped" },
];

function getLatestEpisode(watchHistory) {
  if (!Array.isArray(watchHistory) || watchHistory.length === 0) return null;
  return watchHistory
    .slice()
    .sort((a, b) => (b.episodeNumber || 0) - (a.episodeNumber || 0))[0];
}

export default function Library() {
  const { auth } = useAuthStore();
  const [status, setStatus] = useState(STATUS_TABS[0].value);
  const [page, setPage] = useState(1);

  const { bookmarks, totalPages, isLoading } = useBookmarks({
    status,
    page,
    per_page: 12,
  });

  useEffect(() => {
    setPage(1);
  }, [status]);

  const total = totalPages || 1;
  const canPrev = page > 1;
  const canNext = page < total;

  const items = useMemo(() => bookmarks || [], [bookmarks]);

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 md:px-10 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            My Anime List
          </h1>
          <p className="text-[#bdbad3]">
            Track what you are watching and jump back in anytime.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                status === tab.value
                  ? "bg-[#ffbade] text-black"
                  : "bg-[#2B2A3C] text-white hover:bg-[#3a3950]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!auth && (
          <div className="mt-10 bg-[#2B2A3C] border border-white/10 rounded-2xl p-6">
            <p className="text-lg font-semibold">Sign in to view your list</p>
            <p className="text-[#bdbad3] mt-2">
              Your bookmarks and watch progress are saved to your account.
            </p>
          </div>
        )}

        {auth && isLoading && (
          <div className="mt-12 text-[#bdbad3]">Loading...</div>
        )}

        {auth && !isLoading && items.length === 0 && (
          <div className="mt-12 text-[#bdbad3]">No anime found.</div>
        )}

        {auth && !isLoading && items.length > 0 && (
          <>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((bookmark) => {
                const latest = getLatestEpisode(bookmark.expand?.watchHistory);
                const watchUrl = latest?.episodeNumber
                  ? `/watch/${bookmark.animeId}?ep=${latest.episodeNumber}`
                  : `/watch/${bookmark.animeId}`;
                const detailUrl = `/${bookmark.animeId}`;

                return (
                  <div
                    key={bookmark.id}
                    className="bg-[#2B2A3C] border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                  >
                    <div className="relative">
                      <img
                        src={bookmark.thumbnail}
                        alt={bookmark.animeTitle}
                        className="w-full h-[260px] object-cover"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/70">
                        {STATUS_TABS.find((t) => t.value === status)?.label}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <Link
                        to={detailUrl}
                        className="text-lg font-semibold hover:text-[#ffbade] line-clamp-2"
                      >
                        {bookmark.animeTitle}
                      </Link>
                      {latest?.episodeNumber ? (
                        <p className="text-[#bdbad3] text-sm">
                          Latest episode: {latest.episodeNumber}
                        </p>
                      ) : (
                        <p className="text-[#bdbad3] text-sm">
                          No watch history yet
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-3">
                        <Link
                          to={watchUrl}
                          className="flex-1 text-center bg-[#ffbade] text-black font-semibold py-2 rounded-lg hover:opacity-90"
                        >
                          {latest?.episodeNumber ? "Continue" : "Watch now"}
                        </Link>
                        <Link
                          to={detailUrl}
                          className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:border-[#ffbade] hover:text-[#ffbade]"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrev}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    canPrev
                      ? "bg-[#2B2A3C] hover:bg-[#3a3950]"
                      : "bg-[#1f1e2e] text-[#6f6b85] cursor-not-allowed"
                  }`}
                >
                  Prev
                </button>
                <span className="text-[#bdbad3]">
                  Page {page} of {total}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(total, p + 1))}
                  disabled={!canNext}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    canNext
                      ? "bg-[#2B2A3C] hover:bg-[#3a3950]"
                      : "bg-[#1f1e2e] text-[#6f6b85] cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
