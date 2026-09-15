/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Playlist, PlaylistItem, SearchMode } from '../types';
import {
  Search,
  Youtube,
  Globe,
  Play,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';

interface DualSearchBarProps {
  playlists: Playlist[];
  onSelectTrack: (playlistId: string, track: PlaylistItem) => void;
}

const JAPANESE_KEYWORDS = [
  '吉卜力純音樂',
  '日系 Lofi',
  '和風三味線',
  '昭和 City Pop',
  '雨中京都庭園',
  '喫茶店爵士樂',
];

export const DualSearchBar: React.FC<DualSearchBarProps> = ({
  playlists,
  onSelectTrack,
}) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('local');
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Local Search Results calculation
  const localResults = useMemo(() => {
    if (!query.trim() || searchMode !== 'local') return [];
    const q = query.toLowerCase().trim();

    const matches: { playlist: Playlist; track: PlaylistItem }[] = [];

    for (const pl of playlists) {
      for (const tr of pl.items) {
        if (
          tr.title.toLowerCase().includes(q) ||
          tr.videoId.toLowerCase().includes(q) ||
          (tr.channelTitle && tr.channelTitle.toLowerCase().includes(q)) ||
          pl.name.toLowerCase().includes(q)
        ) {
          matches.push({ playlist: pl, track: tr });
        }
      }
    }

    return matches;
  }, [query, searchMode, playlists]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (searchMode === 'youtube') {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleQuickKeyword = (kw: string) => {
    setQuery(kw);
    if (searchMode === 'youtube') {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(kw)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsDropdownOpen(false);
  };

  return (
    <div id="dual-search-container" className="relative w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-wood-border shadow-zen">
        {/* Toggle Mode Segmented Control */}
        <div className="flex items-center bg-wood-light/80 p-0.5 rounded-xl flex-shrink-0">
          <button
            id="search-mode-local-btn"
            type="button"
            onClick={() => {
              setSearchMode('local');
              setIsDropdownOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              searchMode === 'local'
                ? 'bg-white text-sumi shadow-sm'
                : 'text-sumi-muted hover:text-sumi'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-matcha" />
            <span>搜尋本網頁</span>
          </button>

          <button
            id="search-mode-youtube-btn"
            type="button"
            onClick={() => {
              setSearchMode('youtube');
              setIsDropdownOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              searchMode === 'youtube'
                ? 'bg-white text-akane shadow-sm'
                : 'text-sumi-muted hover:text-sumi'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-akane" />
            <span>搜尋 YouTube</span>
          </button>
        </div>

        {/* Search Input Field */}
        <form
          id="search-input-form"
          onSubmit={handleSearchSubmit}
          className="relative flex-1 flex items-center"
        >
          <Search className="w-4 h-4 text-sumi-faint absolute left-3 pointer-events-none" />
          <input
            id="dual-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={
              searchMode === 'local'
                ? '在已儲存的清單中搜尋歌名、頻道或 Video ID...'
                : '輸入關鍵字搜尋 YouTube 影片 (按 Enter 開啟新分頁)...'
            }
            className="w-full pl-9 pr-16 py-1.5 bg-transparent text-xs sm:text-sm text-sumi placeholder:text-sumi-faint focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-9 text-sumi-faint hover:text-sumi p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {searchMode === 'youtube' && (
            <button
              id="youtube-search-external-btn"
              type="submit"
              disabled={!query.trim()}
              className="px-2.5 py-1 bg-akane text-white text-xs font-medium rounded-lg hover:bg-akane-hover transition-colors flex items-center gap-1 disabled:opacity-40"
              title="在 YouTube 開啟搜尋結果"
            >
              <span>搜尋</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </form>
      </div>

      {/* Quick Keywords for YouTube search mode */}
      {searchMode === 'youtube' && (
        <div className="flex items-center gap-1.5 mt-2 px-1 overflow-x-auto text-[11px] text-sumi-muted">
          <span className="flex items-center gap-1 text-sumi-faint flex-shrink-0">
            <Sparkles className="w-3 h-3 text-kin" />
            <span>和風推薦：</span>
          </span>
          {JAPANESE_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => handleQuickKeyword(kw)}
              className="px-2 py-0.5 rounded-md bg-white/70 hover:bg-white border border-wood-border/60 hover:border-wood text-sumi-light hover:text-akane transition-colors whitespace-nowrap"
            >
              {kw}
            </button>
          ))}
        </div>
      )}

      {/* Local Search Results Dropdown */}
      {searchMode === 'local' && isDropdownOpen && query.trim().length > 0 && (
        <div
          id="local-search-dropdown"
          className="absolute z-50 left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-wood-border rounded-2xl shadow-zen-lg max-h-80 overflow-y-auto p-2 space-y-1"
        >
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-sumi-muted border-b border-wood/40">
            <span>找到 {localResults.length} 首符合的曲目</span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="hover:text-sumi"
            >
              關閉
            </button>
          </div>

          {localResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-sumi-muted">
              找不到與「{query}」相符的已儲存曲目或清單
            </div>
          ) : (
            localResults.map(({ playlist, track }) => (
              <div
                key={`${playlist.id}_${track.id}`}
                id={`search-result-${track.id}`}
                onClick={() => {
                  onSelectTrack(playlist.id, track);
                  setIsDropdownOpen(false);
                }}
                className="group flex items-center justify-between p-2 rounded-xl hover:bg-washi-warm cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <img
                    src={track.thumbnailUrl}
                    alt={track.title}
                    className="w-12 aspect-video rounded-md object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-sumi group-hover:text-akane truncate">
                      {track.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-sumi-muted">
                      <span className="px-1.5 py-0.2 rounded bg-wood-light">
                        {playlist.name}
                      </span>
                      <span>ID: {track.videoId}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-sumi text-washi text-xs group-hover:bg-matcha transition-colors"
                  title="立即播放"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
