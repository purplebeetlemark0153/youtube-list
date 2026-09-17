import React, { useState, useEffect } from 'react';

// 定義角色類型
export type CharacterId = 'dog' | 'girl' | 'dragon' | 'soot';

interface InteractivePetProps {
  isPlaying?: boolean; // 傳入音樂是否播放中（選填，預設為 false）
}

// 四大角色基本設定與對話庫
const CHARACTERS: Record<CharacterId, {
  name: string;
  avatar: string; // 預設以精緻 SVG/Emoji 呈現，隨時可替換成圖片網址
  customImg?: string; // 若有自訂圖片/GIF 網址可填入此處
  quotes: string[];
  musicQuotes: string[];
}> = {
  dog: {
    name: '白色小狗',
    avatar: '🐶',
    quotes: ['汪！今天過得好嗎？', '摸摸我的頭～', '想聽一點輕鬆的音樂！'],
    musicQuotes: ['汪汪！這首歌真好聽 🎵', '（隨著節奏搖尾巴）🐶✨'],
  },
  girl: {
    name: '帽子雙馬尾女孩',
    avatar: '👧',
    quotes: ['準備好要聽什麼歌了嗎？', '紅色書包裡裝滿了播放清單喔！', '今天也要加油！✨'],
    musicQuotes: ['這是我最喜歡的歌！🎶', '（跟著音樂輕聲哼唱~）👧💖'],
  },
  dragon: {
    name: '可愛小火龍',
    avatar: '🐲',
    quotes: ['呼～小心不要被我的小火花燙到！🔥', '龍族也是很懂音樂的！', '想要聽點超酷的歌！'],
    musicQuotes: ['這個 Pass 🔥！太熱血了！', '（高興地噴出小音符火花）🎶🔥'],
  },
  soot: {
    name: '煤炭精靈',
    avatar: '👾',
    quotes: ['……（悄悄地看著你）', '你有帶金平糖嗎？✨', '（滾來滾去）'],
    musicQuotes: ['（隨著拍子興奮地跳躍）✨', '♪(┌・ω・)┌ 🎵'],
  },
};

export const InteractivePet: React.FC<InteractivePetProps> = ({ isPlaying = false }) => {
  // 1. 讀取或儲存角色與位置偏好
  const [character, setCharacter] = useState<CharacterId>(() => {
    return (localStorage.getItem('pet_character') as CharacterId) || 'dog';
  });

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('pet_position');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 120, y: window.innerHeight - 150 };
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
    const newX = Math.max(10, Math.min(window.innerWidth - 80, clientX - dragOffset.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 100, clientY - dragOffset.y));
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
      {/* 💬 對話泡泡 */}
      {dialog && (
        <div className="absolute -top-12 bg-white/95 text-gray-800 text-xs px-3 py-1.5 rounded-xl shadow-lg border border-gray-200 whitespace-nowrap animate-fade-in pointer-events-none">
          {dialog}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-200"></div>
        </div>
      )}

      {/* 🔄 角色切換小選單 */}
      {showMenu && (
        <div className="absolute -top-16 flex gap-1 bg-white/90 p-1.5 rounded-full shadow-md border border-gray-200 backdrop-blur-sm">
          {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
            <button
              key={id}
              onClick={() => handleSelectCharacter(id)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-transform hover:scale-125 ${
                character === id ? 'bg-indigo-100 ring-2 ring-indigo-400' : ''
              }`}
            >
              {CHARACTERS[id].avatar}
            </button>
          ))}
        </div>
      )}

      {/* 🎧 聽歌狀態下的音符氣氛小動畫 */}
      {isPlaying && !isDragging && (
        <div className="absolute -top-4 right-0 text-xs animate-bounce text-indigo-500">
          🎵
        </div>
      )}

      {/* 🐶 角色本體 (支援圖片網址替換) */}
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
          <img src={currentChar.customImg} alt={currentChar.name} className="w-12 h-12 object-contain filter drop-shadow-md" />
        ) : (
          <div className="text-5xl filter drop-shadow-md">
            {currentChar.avatar}
          </div>
        )}
      </div>

      {/* ⚙️ 開啟切換選單的小按鈕 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="mt-1 text-[10px] bg-black/40 hover:bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-md opacity-60 hover:opacity-100 transition-opacity"
      >
        切換角色
      </button>
    </div>
  );
};
