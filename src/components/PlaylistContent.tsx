/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Playlist, PlaylistItem } from '../types';
import { extractYouTubeVideoId, fetchYouTubeVideoInfo, getYouTubeThumbnail } from '../utils/youtube';
import {
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  Edit2,
  Check,
  X,
  Music,
  Shuffle,
  Loader2,
  Info,
} from 'lucide-react';

interface PlaylistContentProps {
  playlist: Playlist;
  currentTrackId: string | null;
  onPlayTrack: (track: PlaylistItem) => void;
  onAddTrack: (track: PlaylistItem) => void;
  onRemoveTrack: (trackId: string) => void;
  onMoveTrack: (index: number, direction: 'up' | 'down') => void;
  onUpdateTrackTitle: (trackId: string, newTitle: string) => void;
  onPlayAll: () => void;
  onShuffleAll: () => void;
}

export const PlaylistContent: React.FC<PlaylistContentProps> = ({
  playlist,
  currentTrackId,
  onPlayTrack,
  onAddTrack,
  onRemoveTrack,
  onMoveTrack,
  onUpdateTrackTitle,
  onPlayAll,
  onShuffleAll,
}) => {
  const [videoInput, setVideoInput] = useState('');
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Inline track title editing
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const videoId = extractYouTubeVideoId(videoInput);
    if (!videoId) {
      setInputError('請輸入有效的 YouTube 影片網址或 11 碼 Video ID');
      return;
    }

    // Check if already in playlist
    const exists = playlist.items.some((item) => item.videoId === videoId);
    if (exists) {
      setInputError('此影片已在目前的播放清單中');
      return;
    }

    setIsFetchingInfo(true);
    try {
      const info = await fetchYouTubeVideoInfo(videoId);
      const newTrack: PlaylistItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        videoId,
        title: info.title,
        thumbnailUrl: getYouTubeThumbnail(videoId),
        addedAt: Date.now(),
        channelTitle: info.authorName,
      };

      onAddTrack(newTrack);
      setVideoInput('');
    } catch {
      setInputError('解析影片資訊失敗，請確認網址後重試');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const startEditTrack = (track: PlaylistItem) => {
    setEditingTrackId(track.id);
    setEditingTitleText(track.title);
  };

  const saveEditTrack = (trackId: string) => {
    if (editingTitleText.trim()) {
      onUpdateTrackTitle(trackId, editingTitleText.trim());
    }
    setEditingTrackId(null);
  };

  return (
    <div
      id="playlist-content-panel"
      className="bg-white/80 hover:bg-white/90 backdrop-blur-md border border-wood-border/80 rounded-2xl p-4 sm:p-5 md:p-6 shadow-zen flex flex-col h-full transition-all"
    >
      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-wood/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-wood-light text-sumi-muted font-medium">
              播放清單
            </span>
            <span className="text-xs text-sumi-faint">
              {playlist.items.length} 首曲目
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-sumi mt-1">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs text-sumi-muted mt-0.5">{playlist.description}</p>
          )}
        </div>

        {/* Quick Batch Actions */}
        {playlist.items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="playlist-play-all-btn"
              onClick={onPlayAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sumi text-washi hover:bg-sumi-light text-xs font-medium transition-all active:scale-95 shadow-sm"
              title="從第一首開始播放"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>依序播放</span>
            </button>

            <button
              id="playlist-shuffle-all-btn"
              onClick={onShuffleAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-wood-light text-sumi hover:bg-wood text-xs font-medium transition-all active:scale-95 border border-wood-border"
              title="隨機選曲播放"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>隨機選曲</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Video Bar */}
      <div className="mt-4">
        <form
          id="add-video-form"
          onSubmit={handleAddVideo}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              id="add-video-input"
              type="text"
              placeholder="貼上 YouTube 影片網址或 Video ID (例如：https://youtu.be/... 或 jfKfPfyJRdk)"
              value={videoInput}
              onChange={(e) => {
                setVideoInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              className="w-full pl-3.5 pr-8 py-2 bg-washi-warm/60 hover:bg-white focus:bg-white border border-wood rounded-xl text-xs sm:text-sm text-sumi placeholder:text-sumi-faint focus:outline-none focus:border-matcha transition-colors"
            />
            {videoInput && (
              <button
                type="button"
                onClick={() => setVideoInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sumi-faint hover:text-sumi"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            id="add-video-submit-btn"
            type="submit"
            disabled={isFetchingInfo || !videoInput.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-matcha hover:bg-matcha-hover text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isFetchingInfo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>解析中...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>加入清單</span>
              </>
            )}
          </button>
        </form>

        {inputError && (
          <p className="mt-1.5 text-xs text-akane flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>{inputError}</span>
          </p>
        )}
      </div>

      {/* Track List */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[380px]">
        {playlist.items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center text-sumi-muted border-2 border-dashed border-wood-border rounded-xl p-6">
            <Music className="w-10 h-10 text-wood-dark stroke-[1.5] mb-2" />
            <p className="text-sm font-medium text-sumi">此播放清單目前沒有任何影片</p>
            <p className="text-xs text-sumi-faint mt-1 max-w-sm">
              請在上方輸入框貼上 YouTube 影片網址或代碼，即可將喜愛的音樂收錄於此清單中。
            </p>
          </div>
        ) : (
          playlist.items.map((item, index) => {
            const isPlaying = item.id === currentTrackId;

            return (
              <div
                key={item.id}
                id={`track-card-${item.id}`}
                className={`group relative flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
                  isPlaying
                    ? 'bg-akane-light/50 border-akane/40 shadow-sm'
                    : 'bg-white/70 hover:bg-white border-wood-border/60 hover:border-wood shadow-none'
                }`}
              >
                {/* Left Section: Index / Playing indicator, Thumbnail, Title */}
                <div
                  className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => onPlayTrack(item)}
                >
                  {/* Playing State or Index */}
                  <div className="w-6 flex items-center justify-center text-xs font-medium text-sumi-muted flex-shrink-0">
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-1 bg-akane h-full animate-pulse" />
                        <span className="w-1 bg-akane h-2/3 animate-ping" />
                        <span className="w-1 bg-akane h-4/5 animate-pulse" />
                      </div>
                    ) : (
                      <span className="group-hover:hidden">{index + 1}</span>
                    )}
                    {!isPlaying && (
                      <Play className="w-3.5 h-3.5 text-matcha fill-current hidden group-hover:block" />
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-16 sm:w-20 aspect-video rounded-lg overflow-hidden bg-sumi flex-shrink-0 shadow-sm">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    {editingTrackId === item.id ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          id={`edit-track-title-input-${item.id}`}
                          type="text"
                          value={editingTitleText}
                          onChange={(e) => setEditingTitleText(e.target.value)}
                          className="w-full px-2 py-0.5 text-xs bg-white border border-matcha rounded text-sumi"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditTrack(item.id);
                            if (e.key === 'Escape') setEditingTrackId(null);
                          }}
                        />
                        <button
                          onClick={() => saveEditTrack(item.id)}
                          className="p-1 text-matcha hover:bg-matcha-light rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTrackId(null)}
                          className="p-1 text-sumi-muted hover:bg-wood-light rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4
                          className={`text-xs sm:text-sm font-medium truncate ${
                            isPlaying ? 'text-akane font-semibold' : 'text-sumi'
                          }`}
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-sumi-muted">
                          <span>{item.channelTitle || 'YouTube'}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-sumi-faint">
                            ID: {item.videoId}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action Tools: Reorder Up/Down, Edit Title, Delete, YouTube Link */}
                <div
                  className="flex items-center gap-1 sm:gap-1.5 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Move Up */}
                  <button
                    id={`track-move-up-${item.id}`}
                    onClick={() => onMoveTrack(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    title="向上移"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    id={`track-move-down-${item.id}`}
                    onClick={() => onMoveTrack(index, 'down')}
                    disabled={index === playlist.items.length - 1}
                    className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    title="向下移"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Title */}
                  <button
                    id={`track-edit-title-${item.id}`}
                    onClick={() => startEditTrack(item)}
                    className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light transition-colors"
                    title="編輯標題"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Open in YouTube */}
                  <a
                    href={`https://www.youtube.com/watch?v=${item.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-sumi-muted hover:text-akane hover:bg-akane-light transition-colors"
                    title="在 YouTube 開啟原始頁面"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete Track */}
                  <button
                    id={`track-delete-${item.id}`}
                    onClick={() => onRemoveTrack(item.id)}
                    className="p-1.5 rounded-lg text-sumi-muted hover:text-akane hover:bg-akane-light transition-colors"
                    title="從清單移除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
