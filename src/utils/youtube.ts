/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts YouTube Video ID from various URL formats or raw 11-char ID.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - Raw 11-character video IDs
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // If already an 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Regex patterns
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
    /music\.youtube\.com\/watch\?v=([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns thumbnail URL for a video ID
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Attempts to fetch real video title via noembed (CORS friendly oEmbed proxy).
 * Falls back to formatted placeholder if network is unavailable or request fails.
 */
export async function fetchYouTubeVideoInfo(videoId: string): Promise<{ title: string; authorName?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          authorName: data.author_name || 'YouTube',
        };
      }
    }
  } catch {
    // Network or timeout failure - silent fallback
  }

  return {
    title: `YouTube 影片 (${videoId})`,
    authorName: 'YouTube',
  };
}
