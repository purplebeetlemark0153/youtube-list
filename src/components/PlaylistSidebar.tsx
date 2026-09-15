/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Playlist } from '../types';
import {
  ListMusic,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Check,
  X,
  FileJson,
  Palette,
  Sparkles,
} from 'lucide-react';

interface PlaylistSidebarProps {
  playlists: Playlist[];
  activePlaylistId: string;
  onSelectPlaylist: (id: string) => void;
  onCreatePlaylist: (name: string, description: string, colorTag: string) => void;
  onRenamePlaylist: (id: string, newName: string) => void;
  onDeletePlaylist: (id: string) => void;
  onMovePlaylist: (index: number, direction: 'up' | 'down') => void;
  onOpenJsonBackup: () => void;
  onOpenBackgroundModal: () => void;
}

const COLOR_OPTIONS = [
  { id: 'matcha', name: '抹茶', bg: 'bg-matcha', text: 'text-matcha', lightBg: 'bg-matcha-light' },
  { id: 'akane', name: '朱赤', bg: 'bg-akane', text: 'text-akane', lightBg: 'bg-akane-light' },
  { id: 'wood', name: '木肌', bg: 'bg-wood-dark', text: 'text-wood-dark', lightBg: 'bg-wood-light' },
  { id: 'kin', name: '和金', bg: 'bg-kin', text: 'text-kin', lightBg: 'bg-kin-light' },
  { id: 'sumi', name: '墨色', bg: 'bg-sumi', text: 'text-sumi', lightBg: 'bg-sumi/10' },
];

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onMovePlaylist,
  onOpenJsonBackup,
  onOpenBackgroundModal,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState('matcha');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim(), selectedColor);
    setIsCreating(false);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
  };

  const handleStartRename = (pl: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(pl.id);
    setEditName(pl.name);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editName.trim()) {
      onRenamePlaylist(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <aside
      id="playlist-sidebar"
      className="bg-white/80 hover:bg-white/90 backdrop-blur-md border border-wood-border/80 rounded-2xl p-4 shadow-zen flex flex-col h-full transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-wood/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-matcha-light text-matcha flex items-center justify-center">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-sumi">播放清單</h3>
            <span className="text-[11px] text-sumi-muted">共 {playlists.length} 個目錄</span>
          </div>
        </div>

        <button
          id="sidebar-create-playlist-btn"
          onClick={handleStartCreate}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-wood-light text-sumi text-xs font-medium hover:bg-wood hover:text-sumi-light transition-all active:scale-95 border border-wood-border"
          title="建立新播放清單"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新增清單</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form
          id="create-playlist-form"
          onSubmit={handleSaveCreate}
          className="mt-3 p-3 bg-washi-warm rounded-xl border border-wood/60 transition-all space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sumi flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-matcha" />
              建立新清單
            </span>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-sumi-muted hover:text-sumi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            id="new-playlist-name-input"
            type="text"
            placeholder="清單名稱 (例如：吉卜力放鬆曲目)"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1.5 bg-white border border-wood rounded-lg text-xs text-sumi focus:outline-none focus:border-matcha"
          />

          <input
            id="new-playlist-desc-input"
            type="text"
            placeholder="備註說明 (選填)"
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
            className="w-full px-2.5 py-1 bg-white border border-wood rounded-lg text-[11px] text-sumi-muted focus:outline-none focus:border-matcha"
          />

          {/* Color tag picker */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-sumi-muted">色彩標籤：</span>
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-4 h-4 rounded-full ${c.bg} transition-transform ${
                    selectedColor === c.id
                      ? 'ring-2 ring-offset-1 ring-sumi scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2.5 py-1 text-xs text-sumi-muted hover:text-sumi"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="px-3 py-1 bg-matcha text-white text-xs font-medium rounded-lg hover:bg-matcha-hover disabled:opacity-40"
            >
              建立
            </button>
          </div>
        </form>
      )}

      {/* Playlist List */}
      <div className="mt-3 space-y-1.5 overflow-y-auto max-h-[380px] pr-1">
        {playlists.map((pl, idx) => {
          const isActive = pl.id === activePlaylistId;
          const colorObj =
            COLOR_OPTIONS.find((c) => c.id === pl.colorTag) || COLOR_OPTIONS[0];

          return (
            <div
              key={pl.id}
              id={`playlist-item-${pl.id}`}
              onClick={() => onSelectPlaylist(pl.id)}
              className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-washi-warm/90 border-wood shadow-sm text-sumi'
                  : 'bg-white/60 hover:bg-white border-transparent hover:border-wood-border/60 text-sumi-muted hover:text-sumi'
              }`}
            >
              {/* Left Indicator & Info */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className={`w-2 h-6 rounded-full flex-shrink-0 ${colorObj.bg} ${
                    isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                  }`}
                />

                {editingId === pl.id ? (
                  <form
                    onSubmit={(e) => handleSaveRename(pl.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 flex-1"
                  >
                    <input
                      id={`rename-input-${pl.id}`}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-0.5 text-xs bg-white border border-matcha rounded text-sumi w-full"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 text-matcha hover:bg-matcha-light rounded"
                      title="確認"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 text-sumi-muted hover:bg-wood-light rounded"
                      title="取消"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-medium truncate ${
                        isActive ? 'text-sumi font-semibold' : 'text-sumi-light'
                      }`}
                    >
                      {pl.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-sumi-faint">
                        {pl.items.length} 首歌曲
                      </span>
                      {pl.description && (
                        <span className="text-[10px] text-sumi-faint truncate max-w-[120px]">
                          • {pl.description}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingId !== pl.id && (
                <div
                  className={`flex items-center gap-0.5 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } transition-opacity`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Move Up */}
                  <button
                    id={`playlist-move-up-${pl.id}`}
                    onClick={() => onMovePlaylist(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-sumi-muted hover:text-sumi hover:bg-wood-light disabled:opacity-20 disabled:hover:bg-transparent"
                    title="向上排序"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    id={`playlist-move-down-${pl.id}`}
                    onClick={() => onMovePlaylist(idx, 'down')}
                    disabled={idx === playlists.length - 1}
                    className="p-1 rounded text-sumi-muted hover:text-sumi hover:bg-wood-light disabled:opacity-20 disabled:hover:bg-transparent"
                    title="向下排序"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Rename */}
                  <button
                    id={`playlist-rename-${pl.id}`}
                    onClick={(e) => handleStartRename(pl, e)}
                    className="p-1 rounded text-sumi-muted hover:text-sumi hover:bg-wood-light"
                    title="重新命名"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    id={`playlist-delete-${pl.id}`}
                    onClick={() => setDeleteConfirmId(pl.id)}
                    className="p-1 rounded text-sumi-muted hover:text-akane hover:bg-akane-light"
                    title="刪除播放清單"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal inline */}
      {deleteConfirmId && (
        <div className="mt-3 p-3 bg-akane-light/90 border border-akane/30 rounded-xl text-xs space-y-2">
          <p className="text-akane font-medium">
            {playlists.length === 1
              ? '刪除最後一個清單將為您自動建立一個全新的空白播放清單。確定要刪除？'
              : '確定要刪除此播放清單與其中所有歌曲？'}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-2 py-1 text-sumi-muted hover:text-sumi"
            >
              取消
            </button>
            <button
              onClick={() => {
                onDeletePlaylist(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
              className="px-2.5 py-1 bg-akane text-white font-medium rounded-lg hover:bg-akane-hover"
            >
              確認刪除
            </button>
          </div>
        </div>
      )}

      {/* Bottom Utilities: JSON Backup & Background Setting */}
      <div className="mt-auto pt-4 border-t border-wood/40 flex flex-col gap-2">
        <button
          id="open-json-backup-btn"
          onClick={onOpenJsonBackup}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-wood-light/60 hover:bg-wood-light text-sumi text-xs font-medium border border-wood-border/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-wood-dark" />
            <span>播放清單備份與還原</span>
          </span>
          <span className="text-[10px] text-sumi-faint">匯出 / 匯入</span>
        </button>

        <button
          id="open-background-modal-btn"
          onClick={onOpenBackgroundModal}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-wood-light/60 hover:bg-wood-light text-sumi text-xs font-medium border border-wood-border/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-matcha" />
            <span>自訂和風桌布</span>
          </span>
          <span className="text-[10px] text-sumi-faint">上傳 / 遮罩</span>
        </button>
      </div>
    </aside>
  );
};
