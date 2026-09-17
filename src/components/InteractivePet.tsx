import React, { useState, useRef } from 'react';

// 定義角色類型（包含新增的自訂角色 custom）
export type CharacterId = 'dog' | 'girl' | 'dragon' | 'soot' | 'custom';

interface InteractivePetProps {
  isPlaying?: boolean; // 傳入音樂是否播放中（選填，預設為 false）
}

// 四大角色基本設定與對話庫
const CHARACTERS: Record<Exclude<CharacterId, 'custom'>, {
  name: string;
  avatar: string;
  customImg?: string;
  quotes: string[];
  musicQuotes: string[];
}> = {
  dog: {
    name: '小白狗',
    avatar: '🐶',
    quotes: ['汪！', '汪汪！', '汪汪汪汪汪！'],
    musicQuotes: ['汪汪！這首歌真好聽 🎵', '（隨著節奏搖尾巴）🐶✨'],
  },
  girl: {
    name: '小女孩',
    avatar: '👧',
    quotes: ['準備好要聽什麼歌了嗎？', '書包裡裝滿了播放清單喔！', '今天也要加油！✨'],
    musicQuotes: ['這是我最喜歡的歌！🎶', '（跟著音樂輕聲哼唱~）👧💖'],
  },
  dragon: {
    name: '小火龍',
    avatar: '🐲',
    quotes: ['🔥FIRE！', 'BURST！！', 'EXPLOSION！！！'],
    musicQuotes: ['這個 Music 🔥！太Hot了！', '（高興地噴出小音符火花）🎶🔥'],
  },
  soot: {
    name: '小精靈',
    avatar: '👾',
    quotes: ['……（悄悄地看著你）', '你有帶金平糖嗎？✨', '（滾來滾去）'],
    musicQuotes: ['（隨著拍子興奮地跳躍）✨', '♪(┌・ω・)┌ 🎵'],
  },
};

export const InteractivePet: React.FC<InteractivePetProps> = ({ isPlaying = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 讀取或儲存角色與位置偏好（同步 localStorage）
  const [character, setCharacter] = useState<CharacterId>(() => {
    const saved = localStorage.getItem('pet_character') as CharacterId;
    return saved ? saved : 'dog';
  });

  // 自訂圖片 Base64 與對話（同步 localStorage）
  const [customImg, setCustomImg] = useState<string | null>(() => {
    return localStorage.getItem('pet_custom_img');
  });

  const [customQuote, setCustomQuote] = useState<string>(() => {
    return localStorage.getItem('pet_custom_quote') || '這是我的自訂小圖示！✨';
  });

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('pet_position');
    return saved ? JSON.parse(saved) : { x: Math.max(20, window.innerWidth - 160), y: 40 };
  });

  // 2. 狀態控管：拖曳、對話框、選單
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dialog, setDialog] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  if (!isVisible) return null;

  // 切換角色
  const handleSelectCharacter = (id: CharacterId) => {
    setCharacter(id);
    localStorage.setItem('pet_character', id);
    setShowMenu(false);
    
    if (id === 'custom') {
      triggerDialog(customQuote);
    } else {
      triggerDialog(`切換成 ${CHARACTERS[id].name} 囉！`);
    }
  };

  // 處理檔案上傳
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setCustomImg(base64Url);
        localStorage.setItem('pet_custom_img', base64Url);
        
        // 詢問使用者自訂對話
        const userPrompt = prompt('請輸入這個小圖示點擊時要顯示的對話：', customQuote);
        const finalQuote = userPrompt !== null && userPrompt.trim() !== '' ? userPrompt : '這是我的自訂小圖示！✨';
        
        setCustomQuote(finalQuote);
        localStorage.setItem('pet_custom_quote', finalQuote);
        
        // 自動切換至自訂圖示
        handleSelectCharacter('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // 修改自訂對話文字
  const handleEditQuote = () => {
    const userPrompt = prompt('修改自訂圖示點擊時顯示的對話：', customQuote);
    if (userPrompt !== null && userPrompt.trim() !== '') {
      setCustomQuote(userPrompt);
      localStorage.setItem('pet_custom_quote', userPrompt);
      triggerDialog(`對話已更新為：${userPrompt}`);
    }
  };

  // 點擊觸發對話
  const handlePetClick = () => {
    if (isDragging) return;

    if (character === 'custom') {
      triggerDialog(customQuote);
    } else {
      const charConfig = CHARACTERS[character];
      const currentList = isPlaying ? charConfig.musicQuotes : charConfig.quotes;
      const randomQuote = currentList[Math.floor(Math.random() * currentList.length)];
      triggerDialog(randomQuote);
    }
  };

  const triggerDialog = (text: string) => {
    setDialog(text);
    setTimeout(() => setDialog(null), 3500);
  };

  // 拖曳邏輯
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragOffset({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 120, clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 140, clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('pet_position', JSON.stringify(position));
    }
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-[9999] select-none touch-none flex flex-col items-center justify-center group"
    >
      {/* 隱藏的 File Input 用於上傳圖片 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ✕ 關閉按鈕（保留在右上角） */}
      <button
        onClick={() => setIsVisible(false)}
        title="關閉角色"
        className="absolute -top-2 -right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-gray-800/70 text-white text-xs hover:bg-red-500 transition-colors shadow-md backdrop-blur-sm"
      >
        ✕
      </button>

      {/* 💬 對話泡泡 */}
      {dialog && (
        <div className="absolute -top-14 bg-white/95 text-gray-800 text-sm font-medium px-4 py-2 rounded-2xl shadow-xl border border-gray-200 whitespace-nowrap pointer-events-none transition-all duration-200">
          {dialog}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-200"></div>
        </div>
      )}

      {/* 🔄 角色切換小選單 */}
      {showMenu && (
        <div className="absolute -top-20 flex gap-2 bg-white/95 p-2 rounded-full shadow-lg border border-gray-200 backdrop-blur-md">
          {(Object.keys(CHARACTERS) as (keyof typeof CHARACTERS)[]).map((id) => (
            <button
              key={id}
              onClick={() => handleSelectCharacter(id)}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-transform hover:scale-125 ${
                character === id ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' : ''
              }`}
            >
              {CHARACTERS[id].avatar}
            </button>
          ))}
          {/* 若已有上傳自訂圖片，顯示自訂圖示選單按鈕 */}
          {customImg && (
            <button
              onClick={() => handleSelectCharacter('custom')}
              className={`w-9 h-9 flex items-center justify-center rounded-full overflow-hidden border transition-transform hover:scale-125 ${
                character === 'custom' ? 'ring-2 ring-indigo-500 scale-110' : ''
              }`}
            >
              <img src={customImg} alt="自訂圖示" className="w-full h-full object-cover" />
            </button>
          )}
        </div>
      )}

      {/* 🎧 聽歌狀態下的音符 */}
      {isPlaying && !isDragging && (
        <div className="absolute -top-6 right-0 text-lg animate-bounce text-indigo-500 font-bold">
          🎵
        </div>
      )}

      {/* 🐶 角色本體（支援拖曳，自訂圖示無跳動動畫） */}
      <div
        onClick={handlePetClick}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {character === 'custom' && customImg ? (
          <img src={customImg} alt="自訂圖示" className="w-28 h-28 object-contain filter drop-shadow-lg" />
        ) : character !== 'custom' && CHARACTERS[character].customImg ? (
          <img src={CHARACTERS[character].customImg} alt={CHARACTERS[character].name} className="w-28 h-28 object-contain filter drop-shadow-lg" />
        ) : (
          <div className="text-[7rem] filter drop-shadow-lg leading-none">
            {character !== 'custom' ? CHARACTERS[character].avatar : '🖼️'}
          </div>
        )}
      </div>

      {/* 功能按鈕區 */}
      <div className="mt-1.5 flex gap-1.5">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-xs bg-black/50 hover:bg-black/70 text-white px-2.5 py-1 rounded-full backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity shadow"
        >
          切換角色
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs bg-indigo-600/70 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-full backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity shadow"
        >
          上傳圖示
        </button>
        {/* 切換到自訂圖示時才顯示修改對話按鈕 */}
        {character === 'custom' && (
          <button
            onClick={handleEditQuote}
            className="text-xs bg-emerald-600/70 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-full backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity shadow"
          >
            修改對話
          </button>
        )}
      </div>
    </div>
  );
};

export default InteractivePet;
