import express from "express";
import cors from "cors";
import { HiAnime } from "@dovakiin0/aniwatch";

const app = express();
app.use(cors());

const hianime = new HiAnime.Scraper();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "up and running" });
});

app.get(
  "/api/home",
  asyncHandler(async (_req, res) => {
    const data = await hianime.getHomePage();
    res.json({ data });
  })
);

app.get(
  "/api/anime/:id",
  asyncHandler(async (req, res) => {
    const data = await hianime.getInfo(req.params.id);
    res.json({ data });
  })
);

app.get(
  "/api/anime/:id/episodes",
  asyncHandler(async (req, res) => {
    const data = await hianime.getEpisodes(req.params.id);
    res.json({ data });
  })
);

app.get(
  "/api/episode/servers",
  asyncHandler(async (req, res) => {
    const animeEpisodeId = req.query.animeEpisodeId;
    if (!animeEpisodeId) {
      return res.status(400).json({ error: "animeEpisodeId is required" });
    }
    const data = await hianime.getEpisodeServers(
      decodeURIComponent(animeEpisodeId)
    );
    res.json({ data });
  })
);

app.get(
  "/api/episode/sources",
  asyncHandler(async (req, res) => {
    const animeEpisodeId = req.query.animeEpisodeId;
    const server = req.query.server || undefined;
    const category = req.query.category || undefined;
    if (!animeEpisodeId) {
      return res.status(400).json({ error: "animeEpisodeId is required" });
    }

    const serverMap = {
      "vidsrc": "hd-1",
      "t-cloud": "hd-2",
      "megacloud": "hd-1",
      "rapidcloud": "hd-2",
      "upcloud": "hd-2",
      "hd-1": "hd-1",
      "hd-2": "hd-2",
      "streamsb": "streamsb",
      "streamtape": "streamtape",
    };

    const decodedEpisodeId = decodeURIComponent(animeEpisodeId);
    const mapped = serverMap[server] || undefined;
    const fallbackOrder = [
      mapped,
      "hd-1",
      "hd-2",
      "streamtape",
      "streamsb",
      undefined,
    ].filter((value, index, arr) => value !== undefined && arr.indexOf(value) === index);

    let lastError = null;
    for (const candidate of fallbackOrder) {
      try {
        const data = await hianime.getEpisodeSources(
          decodedEpisodeId,
          candidate,
          category
        );
        return res.json({ data, serverUsed: candidate || "auto" });
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
  })
);

app.get(
  "/api/search",
  asyncHandler(async (req, res) => {
    const q = req.query.q || "";
    const page = Number(req.query.page || 1);
    const filters = {
      type: req.query.type,
      status: req.query.status,
      rated: req.query.rated,
      season: req.query.season,
      language: req.query.language,
      sort: req.query.sort,
      genres: req.query.genres,
    };
    const data = await hianime.search(q, page, filters);
    res.json({ data });
  })
);

app.get(
  "/api/search/suggestion",
  asyncHandler(async (req, res) => {
    const q = req.query.q || "";
    const data = await hianime.searchSuggestions(q);
    res.json({ data });
  })
);

app.get(
  "/api/schedule",
  asyncHandler(async (req, res) => {
    const date = req.query.date;
    const formattedDate = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const tzOffset = -new Date().getTimezoneOffset();
    const data = await hianime.getEstimatedSchedule(formattedDate, tzOffset);
    res.json({ data });
  })
);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "something went wrong" });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
