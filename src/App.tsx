import { InteractivePet } from './components/InteractivePet';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppData, BackgroundSettings, Playlist, PlaylistItem } from './types';
import {
  loadAppData,
  saveAppData,
  DEFAULT_PRESET_BACKGROUNDS,
} from './utils/storage';
import { YouTubePlayer } from './components/YouTubePlayer';
import { PlaylistSidebar } from './components/PlaylistSidebar';
import { PlaylistContent } from './components/PlaylistContent';
import { DualSearchBar } from './components/DualSearchBar';
import { BackgroundModal } from './components/BackgroundModal';
import { JsonBackupModal } from './components/JsonBackupModal';
import {
  Radio,
  FileJson,
  Palette,
  Music2,
  CheckCircle,
  Smartphone,
  RotateCw,
  MonitorPlay,
} from 'lucide-react';

export default function App() {
  // 1. App Data & State from LocalStorage
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile orientation switching ('auto' | 'portrait' | 'landscape')
  const [mobileOrientationMode, setMobileOrientationMode] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [detectedIsLandscape, setDetectedIsLandscape] = useState(false);

  // Orientation change detection
  useEffect(() => {
    const checkOrientation = () => {
      const isLand =
        window.matchMedia('(orientation: landscape)').matches ||
        (window.innerWidth > window.innerHeight && window.innerWidth < 1024);
      setDetectedIsLandscape(isLand);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const isLandscapeActive =
    mobileOrientationMode === 'landscape' ||
    (mobileOrientationMode === 'auto' && detectedIsLandscape);

  // Save to LocalStorage whenever appData changes
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Find active playlist
  const activePlaylist = useMemo(() => {
    const found = appData.playlists.find((p) => p.id === appData.activePlaylistId);
    return found || appData.playlists[0] || null;
  }, [appData.playlists, appData.activePlaylistId]);

  // Find currently active track
  const currentTrack = useMemo(() => {
    if (!activePlaylist || !activePlaylist.items || activePlaylist.items.length === 0) {
      return null;
    }
    const idx = Math.min(Math.max(0, currentTrackIndex), activePlaylist.items.length - 1);
    return activePlaylist.items[idx] || null;
  }, [activePlaylist, currentTrackIndex]);

  // Ensure currentTrackIndex is valid when activePlaylist changes
  useEffect(() => {
    if (activePlaylist && activePlaylist.items) {
      if (currentTrackIndex >= activePlaylist.items.length) {
        setCurrentTrackIndex(0);
      }
    }
  }, [activePlaylist?.id, activePlaylist?.items?.length]);

  // 2. Playback Navigation Handlers (Continuous Auto-Play)
  const handleNextTrack = useCallback(() => {
    if (!activePlaylist || activePlaylist.items.length === 0) return;

    const total = activePlaylist.items.length;
    if (total <= 1) return;

    if (appData.shuffle) {
      // Pick random different track
      let nextIdx = Math.floor(Math.random() * total);
      if (nextIdx === currentTrackIndex && total > 1) {
        nextIdx = (nextIdx + 1) % total;
      }
      setCurrentTrackIndex(nextIdx);
    } else {
      const nextIdx = currentTrackIndex + 1;
      if (nextIdx < total) {
        setCurrentTrackIndex(nextIdx);
      } else if (appData.loopPlaylist) {
        setCurrentTrackIndex(0);
      }
    }
  }, [activePlaylist, currentTrackIndex, appData.shuffle, appData.loopPlaylist]);

  const handlePrevTrack = useCallback(() => {
    if (!activePlaylist || activePlaylist.items.length === 0) return;

    const total = activePlaylist.items.length;
    if (total <= 1) return;

    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else if (appData.loopPlaylist) {
      setCurrentTrackIndex(total - 1);
    }
  }, [activePlaylist, currentTrackIndex, appData.loopPlaylist]);

  const handleTrackEnded = useCallback(() => {
    if (!appData.autoPlayNext) return;
    handleNextTrack();
  }, [appData.autoPlayNext, handleNextTrack]);

  // 3. Track Operations
  const handlePlayTrack = (track: PlaylistItem) => {
    if (!activePlaylist) return;
    const idx = activePlaylist.items.findIndex((item) => item.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }
  };

  const handleAddTrack = (track: PlaylistItem) => {
    if (!activePlaylist) return;

    const updatedPlaylists = appData.playlists.map((pl) => {
      if (pl.id === activePlaylist.id) {
        return {
          ...pl,
          items: [...pl.items, track],
        };
      }
      return pl;
    });

    setAppData((prev) => ({
      ...prev,
      playlists: updatedPlaylists,
    }));

    showToast(`已將「${track.title}」加入播放清單`);
  };

  const handleRemoveTrack = (trackId: string) => {
    if (!activePlaylist) return;

    const currentTrackItem = activePlaylist.items[currentTrackIndex];
    const updatedItems = activePlaylist.items.filter((item) => item.id !== trackId);

    const updatedPlaylists = appData.playlists.map((pl) => {
      if (pl.id === activePlaylist.id) {
        return {
          ...pl,
          items: updatedItems,
        };
      }
      return pl;
    });

    setAppData((prev) => ({
      ...prev,
      playlists: updatedPlaylists,
    }));

    // Adjust current playing index if needed
    if (currentTrackItem && currentTrackItem.id === trackId) {
      setCurrentTrackIndex((prev) => Math.max(0, Math.min(prev, updatedItems.length - 1)));
    } else if (currentTrackIndex >= updatedItems.length) {
      setCurrentTrackIndex(Math.max(0, updatedItems.length - 1));
    }

    showToast('已從清單移除該歌曲');
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    if (!activePlaylist) return;
    const items = [...activePlaylist.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Keep track of which item is currently playing
    const currentlyPlayingId = items[currentTrackIndex]?.id;

    // Swap
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    const updatedPlaylists = appData.playlists.map((pl) => {
      if (pl.id === activePlaylist.id) {
        return {
          ...pl,
          items,
        };
      }
      return pl;
    });

    setAppData((prev) => ({
      ...prev,
      playlists: updatedPlaylists,
    }));

    // Update playing index to stay with the same track
    if (currentlyPlayingId) {
      const newPlayingIdx = items.findIndex((i) => i.id === currentlyPlayingId);
      if (newPlayingIdx !== -1) {
        setCurrentTrackIndex(newPlayingIdx);
      }
    }
  };

  const handleUpdateTrackTitle = (trackId: string, newTitle: string) => {
    if (!activePlaylist) return;

    const updatedPlaylists = appData.playlists.map((pl) => {
      if (pl.id === activePlaylist.id) {
        return {
          ...pl,
          items: pl.items.map((i) => (i.id === trackId ? { ...i, title: newTitle } : i)),
        };
      }
      return pl;
    });

    setAppData((prev) => ({
      ...prev,
      playlists: updatedPlaylists,
    }));

    showToast('已更新歌曲標題');
  };

  const handlePlayAll = () => {
    setCurrentTrackIndex(0);
    showToast('從第一首開始依序播放');
  };

  const handleShuffleAll = () => {
    if (!activePlaylist || activePlaylist.items.length === 0) return;
    setAppData((prev) => ({ ...prev, shuffle: true }));
    const randomIdx = Math.floor(Math.random() * activePlaylist.items.length);
    setCurrentTrackIndex(randomIdx);
    showToast('已開啟隨機播放並切換歌曲');
  };

  // 4. Playlist Operations
  const handleSelectPlaylist = (id: string) => {
    setAppData((prev) => ({ ...prev, activePlaylistId: id }));
    setCurrentTrackIndex(0);
  };

  const handleCreatePlaylist = (name: string, description: string, colorTag: string) => {
    const newId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPl: Playlist = {
      id: newId,
      name,
      description,
      colorTag,
      createdAt: Date.now(),
      items: [],
    };

    setAppData((prev) => ({
      ...prev,
      playlists: [...prev.playlists, newPl],
      activePlaylistId: newId,
    }));

    setCurrentTrackIndex(0);
    showToast(`已成功建立「${name}」播放清單`);
  };

  const handleRenamePlaylist = (id: string, newName: string) => {
    setAppData((prev) => ({
      ...prev,
      playlists: prev.playlists.map((pl) => (pl.id === id ? { ...pl, name: newName } : pl)),
    }));
    showToast('已重新命名播放清單');
  };

  const handleDeletePlaylist = (id: string) => {
    // If deleting the only remaining playlist, create a fresh empty default playlist so user can cleanly delete
    if (appData.playlists.length <= 1) {
      const freshPl: Playlist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: '我的播放清單',
        description: '新建立的清單',
        colorTag: 'matcha',
        createdAt: Date.now(),
        items: [],
      };

      setAppData((prev) => ({
        ...prev,
        playlists: [freshPl],
        activePlaylistId: freshPl.id,
      }));
      setCurrentTrackIndex(0);
      showToast('已刪除清單並重置為新空白播放清單');
      return;
    }

    const remaining = appData.playlists.filter((pl) => pl.id !== id);
    const newActiveId = appData.activePlaylistId === id ? remaining[0].id : appData.activePlaylistId;

    setAppData((prev) => ({
      ...prev,
      playlists: remaining,
      activePlaylistId: newActiveId,
    }));

    if (appData.activePlaylistId === id) {
      setCurrentTrackIndex(0);
    }
    showToast('已刪除該播放清單');
  };

  const handleMovePlaylist = (index: number, direction: 'up' | 'down') => {
    const playlists = [...appData.playlists];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= playlists.length) return;

    const temp = playlists[index];
    playlists[index] = playlists[targetIdx];
    playlists[targetIdx] = temp;

    setAppData((prev) => ({
      ...prev,
      playlists,
    }));
  };

  // 5. Dual Search Result Selection
  const handleSelectSearchResult = (playlistId: string, track: PlaylistItem) => {
    setAppData((prev) => ({
      ...prev,
      activePlaylistId: playlistId,
    }));

    const pl = appData.playlists.find((p) => p.id === playlistId);
    if (pl) {
      const idx = pl.items.findIndex((item) => item.id === track.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        showToast(`正在播放「${track.title}」`);
      }
    }
  };

  // 6. JSON Import
  const handleImportJsonData = (importedPlaylists: Playlist[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setAppData((prev) => ({
        ...prev,
        playlists: importedPlaylists,
        activePlaylistId: importedPlaylists[0].id,
      }));
      setCurrentTrackIndex(0);
    } else {
      // Merge mode
      const existingIds = new Set(appData.playlists.map((p) => p.id));
      const newItemsToAdd = importedPlaylists.map((pl) => {
        if (existingIds.has(pl.id)) {
          return {
            ...pl,
            id: `pl_imp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            name: `${pl.name} (匯入)`,
          };
        }
        return pl;
      });

      setAppData((prev) => ({
        ...prev,
        playlists: [...prev.playlists, ...newItemsToAdd],
      }));
    }
    showToast('播放清單備份匯入完成！');
  };

  // 7. Background Style computation
  const backgroundStyle = useMemo(() => {
    const bg = appData.backgroundSettings;
    if (bg.type === 'custom' && bg.customDataUrl) {
      return {
        backgroundImage: `url(${bg.customDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
      };
    }

    if (bg.type === 'preset') {
      const preset = DEFAULT_PRESET_BACKGROUNDS[bg.presetId] || DEFAULT_PRESET_BACKGROUNDS.washi;
      return {
        background: preset.css !== 'none' ? preset.css : undefined,
        backgroundColor: preset.backgroundColor,
        backgroundSize: (preset as any).backgroundSize,
        filter: bg.blur ? `blur(${bg.blur}px)` : 'none',
      };
    }

    return {
      backgroundColor: '#FDFBF7',
      filter: 'none',
    };
  }, [appData.backgroundSettings]);

  // Orientation mode switch handler
  const toggleOrientationMode = (mode: 'auto' | 'portrait' | 'landscape') => {
    setMobileOrientationMode(mode);
    if (mode === 'portrait' && screen.orientation && typeof (screen.orientation as any).lock === 'function') {
      try {
        (screen.orientation as any).lock('portrait').catch(() => {});
      } catch {}
    } else if (mode === 'landscape' && screen.orientation && typeof (screen.orientation as any).lock === 'function') {
      try {
        (screen.orientation as any).lock('landscape').catch(() => {});
      } catch {}
    }
    showToast(
      mode === 'auto'
        ? '已設為隨手機自動旋轉'
        : mode === 'portrait'
        ? '已設為手機直式檢視模式'
        : '已設為手機橫式劇院模式'
    );
  };

  return (
    <div className="relative min-h-screen font-sans text-sumi flex flex-col selection:bg-akane selection:text-white">
      {/* Background Visual Layer */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 transition-all duration-500 transform scale-105"
        style={backgroundStyle}
      />

      {/* Dark/Warm Tint Overlay Mask */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          backgroundColor: '#2C2C2C',
          opacity: appData.backgroundSettings.overlayOpacity,
        }}
      />

      {/* Top Bar Header */}
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-washi/90 backdrop-blur-md border-b border-wood-border shadow-zen px-3 sm:px-6 py-2 transition-all"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sumi text-washi flex items-center justify-center shadow-sm">
                <Music2 className="w-4 h-4 text-kin" />
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-serif font-bold tracking-wider text-sumi">
                  音の和
                </h1>
                <span className="text-[11px] font-sans tracking-widest text-wood-dark font-medium uppercase">
                  OTONOWA
                </span>
              </div>
            </div>

            {/* Mobile Header Quick Actions: Orientation Switcher + Modals */}
            <div className="flex items-center gap-1 md:hidden">
              {/* Orientation Switcher for Mobile */}
              <div className="flex items-center bg-wood-light/70 p-0.5 rounded-lg border border-wood-border text-[11px]">
                <button
                  id="header-mobile-orient-auto-btn"
                  onClick={() => toggleOrientationMode('auto')}
                  className={`px-1.5 py-1 rounded transition-all flex items-center gap-0.5 ${
                    mobileOrientationMode === 'auto'
                      ? 'bg-white text-sumi font-semibold shadow-xs'
                      : 'text-sumi-muted hover:text-sumi'
                  }`}
                  title="隨手機方向自動感應"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>自動</span>
                </button>
                <button
                  id="header-mobile-orient-portrait-btn"
                  onClick={() => toggleOrientationMode('portrait')}
                  className={`px-1.5 py-1 rounded transition-all flex items-center gap-0.5 ${
                    mobileOrientationMode === 'portrait'
                      ? 'bg-white text-sumi font-semibold shadow-xs'
                      : 'text-sumi-muted hover:text-sumi'
                  }`}
                  title="手機直式模式"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>直式</span>
                </button>
                <button
                  id="header-mobile-orient-landscape-btn"
                  onClick={() => toggleOrientationMode('landscape')}
                  className={`px-1.5 py-1 rounded transition-all flex items-center gap-0.5 ${
                    mobileOrientationMode === 'landscape'
                      ? 'bg-white text-sumi font-semibold shadow-xs'
                      : 'text-sumi-muted hover:text-sumi'
                  }`}
                  title="手機橫式模式"
                >
                  <MonitorPlay className="w-3 h-3" />
                  <span>橫式</span>
                </button>
              </div>

              <button
                id="header-mobile-json-btn"
                onClick={() => setIsJsonModalOpen(true)}
                className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light"
                title="播放清單備份"
              >
                <FileJson className="w-4 h-4" />
              </button>
              <button
                id="header-mobile-bg-btn"
                onClick={() => setIsBgModalOpen(true)}
                className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light"
                title="自訂桌布"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dual Search Bar (Center) */}
          <div className="w-full md:max-w-xl">
            <DualSearchBar
              playlists={appData.playlists}
              onSelectTrack={handleSelectSearchResult}
            />
          </div>

          {/* Desktop Right Header Action Buttons + Orientation Mode */}
          <div className="hidden md:flex items-center gap-2">
            {/* Desktop / Tablet Orientation toggle */}
            <div className="flex items-center bg-wood-light/70 p-0.5 rounded-xl border border-wood-border text-xs">
              <button
                id="header-desktop-orient-auto-btn"
                onClick={() => toggleOrientationMode('auto')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  mobileOrientationMode === 'auto'
                    ? 'bg-white text-sumi font-medium shadow-xs'
                    : 'text-sumi-muted hover:text-sumi'
                }`}
                title="隨螢幕自動感應"
              >
                <RotateCw className="w-3 h-3" />
                <span>自動</span>
              </button>
              <button
                id="header-desktop-orient-portrait-btn"
                onClick={() => toggleOrientationMode('portrait')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  mobileOrientationMode === 'portrait'
                    ? 'bg-white text-sumi font-medium shadow-xs'
                    : 'text-sumi-muted hover:text-sumi'
                }`}
                title="直式直觀排列"
              >
                <Smartphone className="w-3 h-3" />
                <span>直式</span>
              </button>
              <button
                id="header-desktop-orient-landscape-btn"
                onClick={() => toggleOrientationMode('landscape')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  mobileOrientationMode === 'landscape'
                    ? 'bg-white text-sumi font-medium shadow-xs'
                    : 'text-sumi-muted hover:text-sumi'
                }`}
                title="橫式寬景排列"
              >
                <MonitorPlay className="w-3 h-3" />
                <span>橫式</span>
              </button>
            </div>

            <button
              id="header-desktop-json-btn"
              onClick={() => setIsJsonModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-sumi text-xs font-medium border border-wood-border shadow-zen transition-all active:scale-95"
              title="播放清單備份或還原"
            >
              <FileJson className="w-3.5 h-3.5 text-wood-dark" />
              <span>播放清單備份</span>
            </button>

            <button
              id="header-desktop-bg-btn"
              onClick={() => setIsBgModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-sumi text-xs font-medium border border-wood-border shadow-zen transition-all active:scale-95"
              title="上傳圖片或自訂和風桌布"
            >
              <Palette className="w-3.5 h-3.5 text-matcha" />
              <span>自訂桌布</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Page Workspace: Responsive for Laptop/Desktop, Tablet, and Mobile */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Upper Section: Playlists Directory on Top-Left, Playlist Content on Top-Right */}
        <div
          className={`grid gap-3 md:gap-5 items-stretch ${
            isLandscapeActive
              ? 'grid-cols-12'
              : 'grid-cols-1 md:grid-cols-12'
          }`}
        >
          {/* Playlists Directory (Adaptive for Portrait & Landscape) */}
          <div
            className={`flex flex-col ${
              isLandscapeActive
                ? 'col-span-5 md:col-span-5 lg:col-span-4 min-h-[250px]'
                : 'md:col-span-5 lg:col-span-4 min-h-[280px]'
            }`}
          >
            <PlaylistSidebar
              playlists={appData.playlists}
              activePlaylistId={appData.activePlaylistId}
              onSelectPlaylist={handleSelectPlaylist}
              onCreatePlaylist={handleCreatePlaylist}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onMovePlaylist={handleMovePlaylist}
              onOpenJsonBackup={() => setIsJsonModalOpen(true)}
              onOpenBackgroundModal={() => setIsBgModalOpen(true)}
            />
          </div>

          {/* Playlist Content & Video Add (Adaptive for Portrait & Landscape) */}
          <div
            className={`flex flex-col ${
              isLandscapeActive
                ? 'col-span-7 md:col-span-7 lg:col-span-8 min-h-[280px]'
                : 'md:col-span-7 lg:col-span-8 min-h-[320px]'
            }`}
          >
            {activePlaylist ? (
              <PlaylistContent
                playlist={activePlaylist}
                currentTrackId={currentTrack?.id || null}
                onPlayTrack={handlePlayTrack}
                onAddTrack={handleAddTrack}
                onRemoveTrack={handleRemoveTrack}
                onMoveTrack={handleMoveTrack}
                onUpdateTrackTitle={handleUpdateTrackTitle}
                onPlayAll={handlePlayAll}
                onShuffleAll={handleShuffleAll}
              />
            ) : (
              <div className="bg-white/80 backdrop-blur-md border border-wood-border rounded-2xl p-8 text-center text-sumi-muted flex items-center justify-center h-full">
                請在左上方選擇或建立播放清單
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Embedded Video Player & Controls Deck */}
        <section id="bottom-player-section" className="w-full">
          <YouTubePlayer
            currentTrack={currentTrack}
            playlistName={activePlaylist?.name || '未選擇播放清單'}
            currentIndex={currentTrackIndex}
            totalTracks={activePlaylist?.items.length || 0}
            autoPlayNext={appData.autoPlayNext}
            loopPlaylist={appData.loopPlaylist}
            shuffle={appData.shuffle}
            onTrackEnded={handleTrackEnded}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            onToggleAutoPlay={() =>
              setAppData((p) => ({ ...p, autoPlayNext: !p.autoPlayNext }))
            }
            onToggleLoop={() =>
              setAppData((p) => ({ ...p, loopPlaylist: !p.loopPlaylist }))
            }
            onToggleShuffle={() =>
              setAppData((p) => ({ ...p, shuffle: !p.shuffle }))
            }
          />
        </section>
      </main>

      {/* Floating Zen Toast */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sumi text-washi text-xs font-medium shadow-zen-lg border border-wood-dark/40 animate-fade-in"
        >
          <CheckCircle className="w-4 h-4 text-matcha" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <BackgroundModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        settings={appData.backgroundSettings}
        onUpdateSettings={(newSettings: BackgroundSettings) => {
          setAppData((prev) => ({
            ...prev,
            backgroundSettings: newSettings,
          }));
        }}
      />

      <JsonBackupModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        appData={appData}
        onImportData={handleImportJsonData}
      />
     <InteractivePet />
    </div>
  );
}
