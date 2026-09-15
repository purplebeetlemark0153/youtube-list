/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppData, BackgroundSettings, Playlist } from '../types';

const STORAGE_KEY = 'otonowa_app_data_v1';

export const DEFAULT_PRESET_BACKGROUNDS = {
  washi: {
    id: 'washi',
    name: '和紙素面 (Washi Paper)',
    css: 'radial-gradient(#E5DDD0 1px, transparent 1px), radial-gradient(#E5DDD0 1px, #FDFBF7 1px)',
    backgroundSize: '24px 24px',
    backgroundColor: '#FDFBF7',
  },
  bamboo: {
    id: 'bamboo',
    name: '嵐山竹林 (Bamboo Forest)',
    // Subtle Japanese gradient reflecting bamboo serenity
    css: 'linear-gradient(160deg, #EBF0E9 0%, #DFE7DD 45%, #CBD8C8 100%)',
    backgroundColor: '#EBF0E9',
  },
  kyoto: {
    id: 'kyoto',
    name: '夕暮小路 (Kyoto Sunset)',
    css: 'linear-gradient(135deg, #FBF6EF 0%, #F4E8D7 50%, #ECD8C0 100%)',
    backgroundColor: '#FBF6EF',
  },
  rain: {
    id: 'rain',
    name: '枯山水雨景 (Zen Rain)',
    css: 'linear-gradient(180deg, #EFF1F3 0%, #DFE4E8 60%, #CFD7DD 100%)',
    backgroundColor: '#EFF1F3',
  },
  tatami: {
    id: 'tatami',
    name: '茶室疊蓆 (Tatami Room)',
    css: 'linear-gradient(90deg, #F6F3EC 0%, #EFEBE2 50%, #F6F3EC 100%)',
    backgroundColor: '#F6F3EC',
  },
  none: {
    id: 'none',
    name: '純色極簡 (Clean White)',
    css: 'none',
    backgroundColor: '#FDFBF7',
  },
};

export const INITIAL_DATA: AppData = {
  version: 1,
  activePlaylistId: 'pl_lofi',
  autoPlayNext: true,
  loopPlaylist: true,
  shuffle: false,
  backgroundSettings: {
    type: 'preset',
    presetId: 'washi',
    overlayOpacity: 0.15,
    blur: 0,
  },
  playlists: [
    {
      id: 'pl_lofi',
      name: '日系療癒音楽 (Lofi & Chill)',
      description: '溫暖悠閒的昭和與平成系 Chillhop、雨聲與讀書咖啡廳背景音',
      colorTag: 'matcha',
      createdAt: Date.now() - 3600000 * 24,
      items: [
        {
          id: 'item_1',
          videoId: 'jfKfPfyJRdk',
          title: 'lofi hip hop radio - beats to relax/study to',
          thumbnailUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 20,
          channelTitle: 'Lofi Girl',
        },
        {
          id: 'item_2',
          videoId: '5qap5aO4i9A',
          title: 'lofi hip hop radio - beats to sleep/chill to',
          thumbnailUrl: 'https://img.youtube.com/vi/5qap5aO4i9A/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 15,
          channelTitle: 'Lofi Girl',
        },
        {
          id: 'item_3',
          videoId: 'rUxyKA_-grg',
          title: 'Japanese Garden Ambience ~ Calm Koto & Shakuhachi',
          thumbnailUrl: 'https://img.youtube.com/vi/rUxyKA_-grg/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 10,
          channelTitle: 'Zen Soundscapes',
        },
      ],
    },
    {
      id: 'pl_zen',
      name: '和風禪意環境 (Zen & Nature)',
      description: '日本庭園水琴窟、深山翠竹、傳統尺八與古琴冥想音',
      colorTag: 'wood',
      createdAt: Date.now() - 3600000 * 12,
      items: [
        {
          id: 'item_4',
          videoId: 'WPni755-Krg',
          title: 'Relaxing Japanese Music - Bamboo Water Fountain & Koto',
          thumbnailUrl: 'https://img.youtube.com/vi/WPni755-Krg/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 8,
          channelTitle: 'Traditional Melodies',
        },
        {
          id: 'item_5',
          videoId: '1fueZCTYkpA',
          title: 'Kyoto Temple Gentle Rain Ambience',
          thumbnailUrl: 'https://img.youtube.com/vi/1fueZCTYkpA/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 4,
          channelTitle: 'Nature Ambience',
        },
      ],
    },
    {
      id: 'pl_citypop',
      name: '昭和・平成の街角 (City Pop & Acoustic)',
      description: '東京夜景、復古節奏與柔和的木吉他彈唱旋律',
      colorTag: 'akane',
      createdAt: Date.now() - 3600000 * 6,
      items: [
        {
          id: 'item_6',
          videoId: '3bNITQR4Uso',
          title: 'Miki Matsubara - Stay With Me (Vintage Acoustic Style)',
          thumbnailUrl: 'https://img.youtube.com/vi/3bNITQR4Uso/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 2,
          channelTitle: 'Tokyo Retro',
        },
        {
          id: 'item_7',
          videoId: '9Gj47G2e1Jc',
          title: 'Plastic Love - Japanese City Pop Grooves',
          thumbnailUrl: 'https://img.youtube.com/vi/9Gj47G2e1Jc/mqdefault.jpg',
          addedAt: Date.now() - 3600000 * 1,
          channelTitle: 'City Light Beats',
        },
      ],
    },
  ],
};

/**
 * Loads data from LocalStorage or returns default structure
 */
export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DATA;
    const parsed = JSON.parse(raw);

    if (parsed && Array.isArray(parsed.playlists) && parsed.playlists.length > 0) {
      return {
        ...INITIAL_DATA,
        ...parsed,
        backgroundSettings: {
          ...INITIAL_DATA.backgroundSettings,
          ...(parsed.backgroundSettings || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Failed to parse saved data from LocalStorage, using defaults:', err);
  }
  return INITIAL_DATA;
}

/**
 * Saves current app data to LocalStorage with quota protection
 */
export function saveAppData(data: AppData): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save to LocalStorage (possibly quota exceeded):', err);
    // If quota exceeded and custom background exists, attempt to trim custom background
    if (data.backgroundSettings.customDataUrl) {
      try {
        const copy = {
          ...data,
          backgroundSettings: {
            ...data.backgroundSettings,
            customDataUrl: undefined,
            type: 'preset' as const,
            presetId: 'washi' as const,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
        alert('儲存空間不足，已自動保留播放清單並移除過大的自訂背景圖片。');
        return true;
      } catch {
        // failed
      }
    }
    return false;
  }
}

/**
 * Exports data as a downloadable JSON file
 */
export function exportDataAsJson(data: AppData) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    appName: 'OTONOWA 音の和',
    version: data.version || 1,
    playlists: data.playlists,
    activePlaylistId: data.activePlaylistId,
    backgroundSettings: {
      type: data.backgroundSettings.type,
      presetId: data.backgroundSettings.presetId,
      overlayOpacity: data.backgroundSettings.overlayOpacity,
      blur: data.backgroundSettings.blur,
      // exclude huge custom dataUrl from default export to keep file light unless requested
    },
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `otonowa_playlists_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Compresses an uploaded image file using an offscreen canvas
 * to max 1440px and JPEG quality 0.78 so it securely fits into LocalStorage
 */
export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1440;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('圖片讀取失敗'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsDataURL(file);
  });
}
