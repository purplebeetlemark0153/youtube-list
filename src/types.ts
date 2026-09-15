/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  addedAt: number;
  duration?: string;
  channelTitle?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  colorTag?: string; // Japanese color name: 'akane' | 'matcha' | 'kin' | 'sumi' | 'aizome'
  createdAt: number;
  items: PlaylistItem[];
}

export type PresetBackgroundId = 'washi' | 'bamboo' | 'kyoto' | 'rain' | 'tatami' | 'none';

export interface BackgroundSettings {
  type: 'preset' | 'custom' | 'none';
  presetId: PresetBackgroundId;
  customDataUrl?: string;
  overlayOpacity: number; // 0.05 to 0.90
  blur: number; // 0 to 20 px
}

export interface AppData {
  version: number;
  playlists: Playlist[];
  activePlaylistId: string;
  backgroundSettings: BackgroundSettings;
  autoPlayNext: boolean;
  loopPlaylist: boolean;
  shuffle: boolean;
}

export type SearchMode = 'local' | 'youtube';
