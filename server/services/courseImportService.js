/**
 * Course Import Abstraction Layer.
 *
 * SkillHub does NOT scrape third-party websites. Courses enter the database
 * through one of these permitted, pluggable importers. Each importer must
 * return an array of objects matching the Course model shape (see
 * models/Course.js) so they can be passed straight to Course.insertMany /
 * upsert logic in adminController.
 *
 * Only a manual/seed importer is implemented today. The others are stubbed
 * with a clear contract so they can be wired to real credentials/endpoints
 * without touching any other part of the app.
 */

/** Currently active: admin-entered or seed-file courses. */
async function importFromManualDataset(records) {
  return records; // records already match the Course schema shape
}

/**
 * STUB: Official YouTube Data API v3 (search.list / videos.list) for
 * educational channels/playlists. Requires a YOUTUBE_API_KEY.
 * Contract: return [{ title, description, platform: 'YouTube', instructor,
 * skills, difficulty, durationHours, courseUrl, thumbnailUrl, isFree: true,
 * hasCertificate: false, ... }]
 */
async function importFromYouTubeAPI(/* { query, channelId } */) {
  throw new Error('Not implemented: requires YOUTUBE_API_KEY and network access to YouTube Data API v3.');
}

/**
 * STUB: NPTEL publishes course RSS/JSON feeds for many courses.
 * Contract: parse the feed and map fields into the Course schema shape.
 */
async function importFromNPTELFeed(/* feedUrl */) {
  throw new Error('Not implemented: requires a configured NPTEL feed URL.');
}

/**
 * STUB: Coursera / edX both offer official partner/catalog APIs or public
 * catalog data exports for approved use. Requires partner credentials.
 */
async function importFromCourseraCatalogAPI(/* { apiKey } */) {
  throw new Error('Not implemented: requires Coursera partner API credentials.');
}

async function importFromEdxCatalogAPI(/* { apiKey } */) {
  throw new Error('Not implemented: requires edX catalog API credentials.');
}

module.exports = {
  importFromManualDataset,
  importFromYouTubeAPI,
  importFromNPTELFeed,
  importFromCourseraCatalogAPI,
  importFromEdxCatalogAPI,
};
