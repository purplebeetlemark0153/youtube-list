/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { AppData, Playlist } from '../types';
import { exportDataAsJson } from '../utils/storage';
import {
  X,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface JsonBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onImportData: (importedPlaylists: Playlist[], mode: 'replace' | 'merge') => void;
}

export const JsonBackupModal: React.FC<JsonBackupModalProps> = ({
  isOpen,
  onClose,
  appData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJson(appData);
    setStatusMessage({
      type: 'success',
      text: '已順利產生並下載播放清單備份檔！',
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validate structure
        let importedPlaylists: Playlist[] = [];
        if (Array.isArray(parsed.playlists)) {
          importedPlaylists = parsed.playlists;
        } else if (Array.isArray(parsed)) {
          // If direct array of playlists
          importedPlaylists = parsed;
        } else {
          throw new Error('JSON 格式不符，找不到 playlists 清單陣列');
        }

        // Basic verification of items
        if (importedPlaylists.length === 0) {
          throw new Error('此備份檔內無任何播放清單');
        }

        for (const pl of importedPlaylists) {
          if (!pl.name || !Array.isArray(pl.items)) {
            throw new Error('清單物件格式不正確，缺少名稱或曲目列表');
          }
        }

        onImportData(importedPlaylists, importMode);
        setStatusMessage({
          type: 'success',
          text: `成功匯入 ${importedPlaylists.length} 個播放清單（${
            importMode === 'merge' ? '合併模式' : '覆蓋模式'
          }）`,
        });

        // auto close after 1.5s on success
        setTimeout(() => {
          onClose();
        }, 1600);
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || '無法解析該 JSON 檔案，請確認格式正確',
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: '讀取檔案失敗，請重新選取',
      });
    };

    reader.readAsText(file);
  };

  return (
    <div
      id="json-backup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sumi/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="json-backup-modal-container"
        className="w-full max-w-md bg-white/95 backdrop-blur-md border border-wood-border rounded-2xl p-5 sm:p-6 shadow-zen-lg transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-wood/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-wood-light text-wood-dark flex items-center justify-center">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-sumi">播放清單備份與還原</h3>
              <p className="text-xs text-sumi-muted">無需註冊登入，免帳號備份或更換裝置</p>
            </div>
          </div>

          <button
            id="json-backup-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast Notification */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-matcha-light text-matcha border border-matcha/30'
                : 'bg-akane-light text-akane border border-akane/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Section 1: Export */}
        <div className="mt-4 p-4 bg-washi-warm/80 rounded-xl border border-wood/60 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-sumi">匯出目前資料 (Export)</h4>
              <p className="text-[11px] text-sumi-muted">
                將全部 {appData.playlists.length} 個播放清單與歌曲封裝為備份檔案
              </p>
            </div>
            <button
              id="json-export-action-btn"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sumi hover:bg-sumi-light text-washi text-xs font-medium rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載備份檔</span>
            </button>
          </div>
        </div>

        {/* Section 2: Import */}
        <div className="mt-4 p-4 bg-white rounded-xl border border-wood space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-sumi">匯入備份資料 (Import)</h4>
            <p className="text-[11px] text-sumi-muted">選取先前記存的播放清單備份檔案進行還原</p>
          </div>

          {/* Mode Switch: Merge vs Replace */}
          <div className="flex items-center gap-2 bg-wood-light/40 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setImportMode('merge')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                importMode === 'merge'
                  ? 'bg-white text-sumi shadow-sm'
                  : 'text-sumi-muted hover:text-sumi'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-matcha" />
              <span>合併至現有清單</span>
            </button>

            <button
              type="button"
              onClick={() => setImportMode('replace')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                importMode === 'replace'
                  ? 'bg-white text-akane shadow-sm'
                  : 'text-sumi-muted hover:text-sumi'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-akane" />
              <span>覆蓋全部現有清單</span>
            </button>
          </div>

          {/* Upload Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-wood hover:border-matcha rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-wood-light/10 hover:bg-wood-light/30 transition-colors text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="w-5 h-5 text-wood-dark mb-1" />
            <span className="text-xs font-medium text-sumi">選擇播放清單備份檔案匯入</span>
            <span className="text-[10px] text-sumi-faint mt-0.5">點擊瀏覽檔案 (.json)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-wood/40 flex justify-end">
          <button
            id="json-backup-cancel-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-wood-light text-sumi text-xs font-medium rounded-xl hover:bg-wood transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
