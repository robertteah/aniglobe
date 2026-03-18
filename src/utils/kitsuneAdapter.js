const normalizeApiBase = (raw) => {
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
};

export const getApiBase = () => normalizeApiBase(import.meta.env.VITE_API_URL);

export const mapAnimeCard = (item) => {
  if (!item) return null;
  const episodes = item.episodes || {};
  const epsCount =
    typeof episodes.sub === "number" || typeof episodes.dub === "number"
      ? Math.max(episodes.sub || 0, episodes.dub || 0)
      : null;

  const tvInfo = {
    rating: item.rating ?? item.stats?.rating ?? item.tvInfo?.rating ?? null,
    quality: item.quality ?? item.stats?.quality ?? item.tvInfo?.quality ?? null,
    sub: episodes.sub ?? item.sub ?? item.tvInfo?.sub ?? null,
    dub: episodes.dub ?? item.dub ?? item.tvInfo?.dub ?? null,
    eps: item.tvInfo?.eps ?? epsCount,
    showType: item.type ?? item.tvInfo?.showType ?? "TV",
    duration: item.duration ?? item.stats?.duration ?? item.tvInfo?.duration ?? null,
    releaseDate: item.releaseDate ?? null,
    episodeInfo: item.tvInfo?.episodeInfo ?? {
      sub: episodes.sub ?? null,
      dub: episodes.dub ?? null,
    },
  };

  return {
    id: item.id,
    title: item.name ?? item.title ?? "",
    japanese_title: item.jname ?? item.japanese_title ?? "",
    poster: item.poster ?? "",
    description: item.description ?? item.overview ?? "",
    tvInfo,
    adultContent: item.adultContent ?? false,
  };
};

export const mapSpotlightItem = (item) => {
  const mapped = mapAnimeCard(item);
  if (!mapped) return null;
  return {
    ...mapped,
    description: item.description ?? mapped.description,
  };
};

export const mapTrendingItem = (item) => {
  if (!item) return null;
  return {
    id: item.id,
    title: item.name ?? "",
    japanese_title: item.jname ?? "",
    poster: item.poster ?? "",
    number: item.rank ?? null,
  };
};

export const mapTopTenList = (list = []) =>
  list.map((item) => mapAnimeCard(item)).filter(Boolean);

export const mapAnimeDetailsToLegacy = (details) => {
  if (!details?.anime?.info) return null;
  const info = details.anime.info;
  const moreInfo = details.anime.moreInfo || {};
  const stats = info.stats || {};

  const animeInfo = {
    Overview: info.description ?? "",
    tvInfo: {
      rating: stats.rating ?? null,
      quality: stats.quality ?? null,
      sub: stats.episodes?.sub ?? null,
      dub: stats.episodes?.dub ?? null,
      showType: stats.type ?? "",
      duration: stats.duration ?? null,
    },
    Genres: moreInfo.genres ?? [],
    Japanese: moreInfo.japanese ?? "",
    Synonyms: moreInfo.synonyms ?? "",
    Aired: moreInfo.aired ?? "",
    Status: moreInfo.status ?? "",
    Producers: moreInfo.producers ?? [],
    Studios: moreInfo.studios ?? "",
    MAL: moreInfo.malscore ?? "",
    "MAL Score": moreInfo.malscore ?? "",
    Duration: moreInfo.duration ?? stats.duration ?? "",
    Premiered: moreInfo.premiered ?? "",
    Rating: stats.rating ?? "",
  };

  return {
    id: info.id,
    data_id: info.id,
    title: info.name ?? "",
    japanese_title: moreInfo.japanese ?? "",
    poster: info.poster ?? "",
    showType: stats.type ?? "",
    adultContent: stats.rating === "R+" || stats.rating === "Rx" || stats.rating === "18+",
    animeInfo,
    charactersVoiceActors: (info.charactersVoiceActors || []).map((item) => ({
      character: item.character,
      voiceActors: item.voiceActor ? [item.voiceActor] : [],
    })),
    recommended_data: (details.recommendedAnimes || [])
      .map((item) => mapAnimeCard(item))
      .filter(Boolean),
    related_data: (details.relatedAnimes || [])
      .map((item) => mapAnimeCard(item))
      .filter(Boolean),
  };
};

export const mapSeasonsToLegacy = (seasons = []) =>
  seasons.map((season) => ({
    id: season.id,
    season: season.name ?? season.title ?? "",
    season_poster: season.poster ?? "",
  }));

export const mapEpisodesToLegacy = (episodes = []) =>
  episodes.map((ep) => ({
    id: ep.episodeId,
    episode_no: ep.number,
    title: ep.title ?? "",
    isFiller: ep.isFiller ?? false,
  }));

export const mapScheduleToLegacy = (scheduled = []) =>
  scheduled.map((item) => ({
    id: item.id,
    time: item.time ?? null,
    title: item.name ?? item.jname ?? "",
    episode_no: item.episode ?? null,
  }));
