/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { BackgroundSettings, PresetBackgroundId } from '../types';
import { DEFAULT_PRESET_BACKGROUNDS, compressImageToDataUrl } from '../utils/storage';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BackgroundSettings;
  onUpdateSettings: (newSettings: BackgroundSettings) => void;
}

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('請選擇常見圖片格式 (JPG, PNG, WebP)');
      return;
    }

    setUploadError(null);
    setIsCompressing(true);

    try {
      const dataUrl = await compressImageToDataUrl(file);
      onUpdateSettings({
        ...settings,
        type: 'custom',
        customDataUrl: dataUrl,
      });
    } catch {
      setUploadError('圖片壓縮或讀取失敗，請更換其他圖片');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (presetId: PresetBackgroundId) => {
    onUpdateSettings({
      ...settings,
      type: 'preset',
      presetId,
    });
  };

  const handleReset = () => {
    onUpdateSettings({
      type: 'preset',
      presetId: 'washi',
      overlayOpacity: 0.15,
      blur: 0,
      customDataUrl: undefined,
    });
  };

  return (
    <div
      id="background-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sumi/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="background-modal-container"
        className="w-full max-w-lg bg-white/95 backdrop-blur-md border border-wood-border rounded-2xl p-5 sm:p-6 shadow-zen-lg transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-wood/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-matcha-light text-matcha flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-sumi">自訂視覺桌布與遮罩</h3>
              <p className="text-xs text-sumi-muted">營造專屬日式風格沈浸視聽空間</p>
            </div>
          </div>

          <button
            id="background-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-sumi-muted hover:text-sumi hover:bg-wood-light"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Selection */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-sumi flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-kin" />
            <span>和風經典預設背景</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {Object.values(DEFAULT_PRESET_BACKGROUNDS).map((preset) => {
              const isSelected =
                settings.type === 'preset' && settings.presetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id as PresetBackgroundId)}
                  className={`relative p-2.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                    isSelected
                      ? 'border-matcha ring-2 ring-matcha/30 bg-washi-warm'
                      : 'border-wood hover:border-wood-dark bg-white'
                  }`}
                  style={{
                    background:
                      preset.id === 'washi'
                        ? '#FDFBF7'
                        : preset.backgroundColor || '#FDFBF7',
                  }}
                >
                  <span className="text-[11px] font-medium text-sumi truncate">
                    {preset.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-sumi-muted truncate">
                    {preset.name.split(' ')[1] || ''}
                  </span>

                  {isSelected && (
                    <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-matcha text-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Upload Section */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-sumi flex items-center gap-1.5 mb-2">
            <Upload className="w-3.5 h-3.5 text-matcha" />
            <span>上傳自訂本地圖片</span>
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              settings.type === 'custom' && settings.customDataUrl
                ? 'border-matcha bg-matcha-light/20'
                : 'border-wood hover:border-matcha bg-wood-light/20 hover:bg-wood-light/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {isCompressing ? (
              <div className="flex items-center gap-2 text-xs text-matcha py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在壓縮與優化圖片...</span>
              </div>
            ) : settings.type === 'custom' && settings.customDataUrl ? (
              <div className="flex items-center gap-3 w-full">
                <img
                  src={settings.customDataUrl}
                  alt="Custom preview"
                  className="w-16 h-12 object-cover rounded-lg border border-wood shadow-sm"
                />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-medium text-sumi">已套用自訂桌布</p>
                  <p className="text-[10px] text-sumi-muted truncate">
                    點擊可重新更換其他圖片 (已自動優化並存於 LocalStorage)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Upload className="w-6 h-6 text-wood-dark mb-1" />
                <span className="text-xs font-medium text-sumi">點擊選擇本機圖片</span>
                <span className="text-[10px] text-sumi-muted mt-0.5">
                  支援 JPG, PNG, WebP (自動調整大小並存入 LocalStorage)
                </span>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="mt-1 text-xs text-akane">{uploadError}</p>
          )}
        </div>

        {/* Sliders: Overlay Opacity & Blur */}
        <div className="mt-5 space-y-4 bg-wood-light/30 p-3.5 rounded-xl border border-wood-border">
          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-sumi flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sumi-muted" />
                <span>深色遮罩濃度 (Overlay)</span>
              </span>
              <span className="font-mono text-sumi-muted">
                {Math.round(settings.overlayOpacity * 100)}%
              </span>
            </div>
            <input
              id="bg-opacity-range"
              type="range"
              min="0"
              max="0.85"
              step="0.05"
              value={settings.overlayOpacity}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  overlayOpacity: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-wood rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-sumi-faint mt-1">
              <span>完全清澈 (0%)</span>
              <span>適度護眼 (35%)</span>
              <span>深沉 (85%)</span>
            </div>
          </div>

          {/* Blur Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-sumi">背景柔焦模糊 (Blur)</span>
              <span className="font-mono text-sumi-muted">{settings.blur}px</span>
            </div>
            <input
              id="bg-blur-range"
              type="range"
              min="0"
              max="16"
              step="1"
              value={settings.blur}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  blur: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-wood rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-3 border-t border-wood/40 flex items-center justify-between">
          <button
            id="reset-bg-defaults-btn"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-sumi-muted hover:text-sumi hover:bg-wood-light rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢復預設值</span>
          </button>

          <button
            id="close-bg-modal-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-sumi text-washi text-xs font-medium rounded-xl hover:bg-sumi-light transition-colors"
          >
            完成儲存
          </button>
        </div>
      </div>
    </div>
  );
};
