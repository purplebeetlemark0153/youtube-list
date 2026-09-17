import React, { useState } from 'react';

// 定義角色類型
export type CharacterId = 'dog' | 'girl' | 'dragon' | 'soot';

interface InteractivePetProps {
  isPlaying?: boolean; // 傳入音樂是否播放中（選填，預設為 false）
}

// 四大角色基本設定與對話庫
const CHARACTERS: Record<CharacterId, {
  name: string;
  avatar: string; // 預設以精緻 Emoji 呈現，隨時可替換成圖片網址
  customImg?: string; // 若有自訂圖片/GIF 網址可填入此處
  quotes: string[];
  musicQuotes: string[];
}> = {
  dog: {
    name: '小白狗',
    avatar: '🐶',
    quotes: ['汪！', '汪汪！', '汪汪汪汪汪！''],
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
  // 1. 讀取或儲存角色與位置偏好（預設在右上角）
  const [character, setCharacter] = useState<CharacterId>(() => {
    return (localStorage.getItem('pet_character') as CharacterId) || 'dog';
  });

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('pet_position');
    // 預設位置改為右上角 (X: 視窗寬度 - 140, Y: 40)
    return saved ? JSON.parse(saved) : { x: Math.max(20, window.innerWidth - 140), y: 40 };
  });

  // 2. 狀態控管：拖曳、對話框、選單
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dialog, setDialog] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // 切換角色
  const handleSelectCharacter = (id: CharacterId) => {
    setCharacter(id);
    localStorage.setItem('pet_character', id);
    setShowMenu(false);
    triggerDialog(`切換成 ${CHARACTERS[id].name} 囉！`);
  };

  // 點擊觸發隨機對話
  const handlePetClick = () => {
    if (isDragging) return;
    const currentList = isPlaying ? CHARACTERS[character].musicQuotes : CHARACTERS[character].quotes;
    const randomQuote = currentList[Math.floor(Math.random() * currentList.length)];
    triggerDialog(randomQuote);
  };

  const triggerDialog = (text: string) => {
    setDialog(text);
    setTimeout(() => setDialog(null), 3500); // 3.5 秒後自動隱藏對話
  };

  // 拖曳邏輯 (MouseEvent & TouchEvent)
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragOffset({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newX = Math.max(10, Math.min(window.innerWidth - 100, clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 120, clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('pet_position', JSON.stringify(position));
    }
  };

  const currentChar = CHARACTERS[character];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-[9999] select-none touch-none flex flex-col items-center justify-center"
    >
      {/* 💬 對話泡泡（字體與邊框加大） */}
      {dialog && (
        <div className="absolute -top-14 bg-white/95 text-gray-800 text-sm font-medium px-4 py-2 rounded-2xl shadow-xl border border-gray-200 whitespace-nowrap animate-fade-in pointer-events-none">
          {dialog}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-200"></div>
        </div>
      )}

      {/* 🔄 角色切換小選單（按鈕加大） */}
      {showMenu && (
        <div className="absolute -top-20 flex gap-2 bg-white/95 p-2 rounded-full shadow-lg border border-gray-200 backdrop-blur-md">
          {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
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
        </div>
      )}

      {/* 🎧 聽歌狀態下的音符氣氛小動畫（加大放大） */}
      {isPlaying && !isDragging && (
        <div className="absolute -top-6 right-0 text-base animate-bounce text-indigo-500 font-bold">
          🎵
        </div>
      )}

      {/* 🐶 角色本體（放大尺寸至 text-11xl / w-40 h-40） */}
      <div
        onClick={handlePetClick}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        className={`relative cursor-grab active:cursor-grabbing transition-transform duration-200 ${
          isDragging ? 'scale-125 rotate-6' : isPlaying ? 'animate-pulse' : 'hover:scale-110'
        }`}
      >
        {currentChar.customImg ? (
          <img src={currentChar.customImg} alt={currentChar.name} className="w-20 h-20 object-contain filter drop-shadow-lg" />
        ) : (
          <div className="text-11xl filter drop-shadow-lg leading-none">
            {currentChar.avatar}
          </div>
        )}
      </div>

      {/* ⚙️ 開啟切換選單的小按鈕 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="mt-1.5 text-xs bg-black/50 hover:bg-black/70 text-white px-2.5 py-1 rounded-full backdrop-blur-md opacity-70 hover:opacity-100 transition-opacity shadow"
      >
        切換角色
      </button>
    </div>
  );
};
