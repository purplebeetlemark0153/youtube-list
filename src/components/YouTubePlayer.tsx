/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PlaylistItem } from '../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface YouTubePlayerProps {
  currentTrack: PlaylistItem | null;
  playlistName: string;
  currentIndex: number;
  totalTracks: number;
  autoPlayNext: boolean;
  loopPlaylist: boolean;
  shuffle: boolean;
  onTrackEnded: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleAutoPlay: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentTrack,
  playlistName,
  currentIndex,
  totalTracks,
  autoPlayNext,
  loopPlaylist,
  shuffle,
  onTrackEnded,
  onNext,
  onPrev,
  onToggleAutoPlay,
  onToggleLoop,
  onToggleShuffle,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);

  // Initialize YouTube Iframe API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !playerContainerRef.current) return;

      // Clean existing instance if any
      if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === 'function') {
        try {
          playerInstanceRef.current.destroy();
        } catch {
          // ignore
        }
      }

      playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: currentTrack ? currentTrack.videoId : '',
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            setIsPlayerReady(true);
            try {
              event.target.setVolume(volume);
              if (currentTrack) {
                event.target.playVideo();
              }
            } catch {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            // 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onTrackEnded();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setPlayerError(null);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
          onError: (event: any) => {
            if (!isMounted) return;
            console.warn('YouTube Player error code:', event.data);
            setPlayerError('此影片可能被原作者限制嵌入，將為您嘗試播放下一首');
            // Auto skip after 2.5 seconds on unplayable video
            setTimeout(() => {
              if (isMounted && autoPlayNext) {
                onNext();
              }
            }, 2500);
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'yt-api-script';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // When currentTrack changes, load video
  useEffect(() => {
    setPlayerError(null);
    if (playerInstanceRef.current && isPlayerReady && currentTrack) {
      try {
        playerInstanceRef.current.loadVideoById(currentTrack.videoId);
        setIsPlaying(true);
      } catch (err) {
        console.warn('Error loading video by ID:', err);
      }
    }
  }, [currentTrack?.videoId, isPlayerReady]);

  // Handle Play/Pause toggle
  const togglePlayPause = () => {
    if (!playerInstanceRef.current) return;
    try {
      if (isPlaying) {
        playerInstanceRef.current.pauseVideo();
      } else {
        playerInstanceRef.current.playVideo();
      }
    } catch {
      // fallback
    }
  };

  // Handle Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.setVolume(newVol);
        if (newVol > 0 && isMuted) {
          playerInstanceRef.current.unMute();
          setIsMuted(false);
        }
      } catch {
        // ignore
      }
    }
  };

  // Handle Mute toggle
  const toggleMute = () => {
    if (!playerInstanceRef.current) return;
    try {
      if (isMuted) {
        playerInstanceRef.current.unMute();
        setIsMuted(false);
      } else {
        playerInstanceRef.current.mute();
        setIsMuted(true);
      }
    } catch {
      // ignore
    }
  };

  // HTML5 Fullscreen API toggle with fallback for iframe environments
  const toggleFullscreen = async () => {
    const targetElement = playerWrapperRef.current;
    if (!targetElement) return;

    try {
      const isCurrentlyFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFs) {
        if (targetElement.requestFullscreen) {
          await targetElement.requestFullscreen();
        } else if ((targetElement as any).webkitRequestFullscreen) {
          await (targetElement as any).webkitRequestFullscreen();
        } else if ((targetElement as any).mozRequestFullScreen) {
          await (targetElement as any).mozRequestFullScreen();
        } else if ((targetElement as any).msRequestFullscreen) {
          await (targetElement as any).msRequestFullscreen();
        } else {
          // Fallback to CSS theater fullscreen mode
          setIsWindowFullscreen((prev) => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Native fullscreen request restricted or failed, using theater fullscreen fallback:', err);
      setIsWindowFullscreen((prev) => !prev);
    }
  };

  // Fullscreen change listener and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
      if (!isFs) {
        setIsWindowFullscreen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input/textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isWindowFullscreen) {
          setIsWindowFullscreen(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWindowFullscreen]);

  return (
    <div
      id="youtube-player-deck"
      className={`bg-white/80 hover:bg-white/90 backdrop-blur-md border border-wood-border/80 rounded-2xl p-3 sm:p-5 md:p-6 shadow-zen transition-all ${
        isWindowFullscreen
          ? 'fixed inset-0 z-[100] rounded-none bg-black/95 p-3 sm:p-6 flex flex-col justify-between overflow-y-auto'
          : ''
      }`}
    >
      {/* Full-width Video Screen Frame (Expanded to span full width matching the left+right layout) */}
      <div
        ref={playerWrapperRef}
        id="player-wrapper-viewport"
        className={`relative w-full aspect-video rounded-xl overflow-hidden bg-sumi shadow-inner border border-wood/40 transition-all ${
          isFullscreen
            ? 'fixed inset-0 z-[9999] rounded-none border-none aspect-auto h-screen w-screen flex items-center justify-center bg-black'
            : 'max-h-[58vh] lg:max-h-[66vh]'
        }`}
      >
        {currentTrack ? (
          <div className="w-full h-full" ref={playerContainerRef} id="yt-player-container" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-wood-light/80 p-6 text-center">
            <Radio className="w-12 h-12 mb-2 text-wood-dark stroke-[1.5] animate-pulse" />
            <p className="text-base sm:text-lg font-medium text-washi">目前播放清單尚無影片</p>
            <p className="text-xs text-wood-dark mt-1">請在上方輸入 YouTube 網址加入播放</p>
          </div>
        )}

        {/* Quick Fullscreen Floating Button on Video */}
        <div className="absolute bottom-3 right-3 z-20">
          <button
            id="player-video-quick-fullscreen-btn"
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all shadow-md flex items-center gap-1.5 text-xs active:scale-95"
            title={isFullscreen || isWindowFullscreen ? '退出全螢幕 (Esc)' : '全螢幕播放 (F)'}
          >
            {isFullscreen || isWindowFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-kin" />
                <span className="hidden sm:inline">退出全螢幕</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-kin" />
                <span className="hidden sm:inline">全螢幕</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Error Warning if embed failed */}
        {playerError && (
          <div className="absolute top-3 inset-x-3 bg-akane/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm shadow flex items-center justify-between z-20">
            <span className="truncate">{playerError}</span>
            <button
              id="player-skip-error-btn"
              onClick={onNext}
              className="ml-2 underline font-medium hover:text-washi flex-shrink-0"
            >
              略過
            </button>
          </div>
        )}
      </div>

      {/* Full-width Track Info & Controls Deck */}
      <div className={`mt-4 space-y-3.5 ${isWindowFullscreen ? 'text-white' : ''}`}>
        {/* Meta & Info bar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3 ${
            isWindowFullscreen ? 'border-white/20' : 'border-wood/40'
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-matcha-light text-matcha-dark font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-matcha animate-ping" />
                {playlistName}
              </span>
              {totalTracks > 0 && (
                <span
                  className={`text-xs ${
                    isWindowFullscreen ? 'text-gray-300' : 'text-sumi-muted'
                  }`}
                >
                  第 {currentIndex + 1} 首 / 共 {totalTracks} 首
                </span>
              )}
            </div>
            <h2
              className={`text-base sm:text-lg md:text-xl font-medium truncate mt-1.5 ${
                isWindowFullscreen ? 'text-white' : 'text-sumi'
              }`}
              title={currentTrack?.title || '未選擇播放曲目'}
            >
              {currentTrack?.title || '請選擇或加入影片開始播放'}
            </h2>
            {currentTrack && (
              <p
                className={`text-xs flex items-center gap-2 mt-0.5 ${
                  isWindowFullscreen ? 'text-gray-300' : 'text-sumi-muted'
                }`}
              >
                <span className="truncate max-w-[200px] sm:max-w-[360px]">
                  {currentTrack.channelTitle || 'YouTube'}
                </span>
                <span>•</span>
                <a
                  href={`https://www.youtube.com/watch?v=${currentTrack.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-akane transition-colors text-sumi-faint"
                  title="在 YouTube 開啟原始影片"
                >
                  開啟原始網頁
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
          </div>

          {/* Japanese subtle seal tag */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-serif tracking-wider self-start sm:self-center ${
              isWindowFullscreen
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-wood-light/60 border-wood-border/60 text-wood-darker'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-kin" />
            <span>連續自動再生中</span>
          </div>
        </div>

        {/* Primary Player Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-1">
          {/* Playback action buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2">
            {/* Shuffle Button */}
            <button
              id="player-shuffle-btn"
              onClick={onToggleShuffle}
              title={shuffle ? '隨機播放：已開啟' : '隨機播放：已關閉'}
              className={`p-2.5 rounded-xl transition-colors ${
                shuffle
                  ? 'bg-matcha text-white'
                  : 'bg-wood-light/70 text-sumi-muted hover:text-sumi hover:bg-wood'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous Button */}
            <button
              id="player-prev-btn"
              onClick={onPrev}
              disabled={totalTracks <= 1}
              title="上一首"
              className="p-2.5 rounded-xl bg-wood-light/80 text-sumi hover:bg-wood hover:text-sumi transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              id="player-play-pause-btn"
              onClick={togglePlayPause}
              disabled={!currentTrack}
              title={isPlaying ? '暫停' : '播放'}
              className="px-6 py-2.5 rounded-xl bg-sumi text-washi hover:bg-sumi-light active:scale-95 transition-all shadow-sm flex items-center gap-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span className="text-xs sm:text-sm">暫停</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span className="text-xs sm:text-sm">播放</span>
                </>
              )}
            </button>

            {/* Next Button */}
            <button
              id="player-next-btn"
              onClick={onNext}
              disabled={totalTracks <= 1}
              title="下一首"
              className="p-2.5 rounded-xl bg-wood-light/80 text-sumi hover:bg-wood hover:text-sumi transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Loop Button */}
            <button
              id="player-loop-btn"
              onClick={onToggleLoop}
              title={loopPlaylist ? '清單循環：已開啟' : '清單循環：已關閉'}
              className={`p-2.5 rounded-xl transition-colors ${
                loopPlaylist
                  ? 'bg-matcha text-white'
                  : 'bg-wood-light/70 text-sumi-muted hover:text-sumi hover:bg-wood'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary: Auto-Play Next Toggle & Volume & Fullscreen Button */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4">
            {/* Continuous Auto-play toggle button */}
            <button
              id="player-autoplay-toggle-btn"
              onClick={onToggleAutoPlay}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                autoPlayNext
                  ? 'bg-akane-light text-akane border-akane/30'
                  : 'bg-wood-light/50 text-sumi-muted border-wood-border'
              }`}
              title="播完自動載入並播放下一首"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoPlayNext ? 'bg-akane animate-pulse' : 'bg-sumi-faint'
                }`}
              />
              <span>連續自動播</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button
                id="player-mute-toggle-btn"
                onClick={toggleMute}
                className="p-1.5 text-sumi-muted hover:text-sumi transition-colors"
                title={isMuted ? '取消靜音' : '靜音'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-akane" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                id="player-volume-slider"
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1.5 bg-wood rounded-lg appearance-none cursor-pointer"
                title={`音量: ${volume}%`}
              />
            </div>

            {/* Fullscreen Button (Available on all versions) */}
            <button
              id="player-dock-fullscreen-btn"
              onClick={toggleFullscreen}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
                isFullscreen || isWindowFullscreen
                  ? 'bg-sumi text-washi border-sumi shadow-sm'
                  : 'bg-wood-light/80 text-sumi hover:bg-wood hover:text-sumi border-wood-border shadow-sm'
              }`}
              title={isFullscreen || isWindowFullscreen ? '退出全螢幕 (Esc)' : '全螢幕播放 (F)'}
            >
              {isFullscreen || isWindowFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-kin" />
                  <span className="hidden sm:inline">退出全螢幕</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-kin" />
                  <span className="hidden sm:inline">全螢幕</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
