
import React, { useState, useCallback, useMemo } from 'react';
import { Color, Tool, GameStatus, Level } from './types';
import { GET_LEVEL, MAX_LEVEL_COUNT } from './constants';
import { createEmptyGrid, applyTool, checkWin } from './services/gameLogic';
import { Grid } from './components/Grid';
import { ColorButton, ToolButton, GameButton } from './components/UI';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [grid, setGrid] = useState<Color[][]>([]);
  const [movesLeft, setMovesLeft] = useState(0);
  const [undosLeft, setUndosLeft] = useState(0);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [history, setHistory] = useState<Color[][][]>([]);
  
  // For Level Select
  const [levelSearch, setLevelSearch] = useState('');
  const [visibleLevelCount, setVisibleLevelCount] = useState(50);

  const startLevel = useCallback((levelId: number) => {
    const level = GET_LEVEL(levelId);
    setCurrentLevel(level);
    setGrid(createEmptyGrid(level.gridSize));
    setMovesLeft(level.moves);
    setUndosLeft(level.undos ?? 5);
    setSelectedColor(level.availableColors[0]);
    setSelectedTool(level.availableTools[0]);
    setHistory([]);
    setStatus('PLAYING');
  }, []);

  const handleTileClick = (r: number, c: number) => {
    if (status !== 'PLAYING' || !selectedColor || !selectedTool || movesLeft <= 0) return;

    setHistory(prev => [...prev, grid.map(row => [...row])]);

    const nextGrid = applyTool(grid, selectedTool, selectedColor, r, c);
    setGrid(nextGrid);
    
    const hasWon = checkWin(nextGrid, currentLevel!.target);
    const newMovesLeft = movesLeft - 1;
    setMovesLeft(newMovesLeft);

    if (hasWon) {
      setTimeout(() => setStatus('WON'), 100);
    } else if (newMovesLeft <= 0) {
      setStatus('LOST');
    }
  };

  const undo = () => {
    if (history.length === 0 || status !== 'PLAYING' || undosLeft <= 0) return;
    const prev = history[history.length - 1];
    setGrid(prev);
    setHistory(prevHistory => prevHistory.slice(0, -1));
    setMovesLeft(prev => prev + 1);
    setUndosLeft(prev => prev - 1);
  };

  const reset = () => {
    if (currentLevel) startLevel(currentLevel.id);
  };

  const nextLevel = () => {
    if (!currentLevel) return;
    startLevel(currentLevel.id + 1);
  };

  const levelButtons = useMemo(() => {
    const buttons = [];
    for (let i = 1; i <= visibleLevelCount; i++) {
      buttons.push(i);
    }
    return buttons;
  }, [visibleLevelCount]);

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col text-slate-900 overflow-hidden select-none">
      
      {/* HEADER */}
      {status === 'PLAYING' && currentLevel && (
        <div className="p-4 flex justify-between items-center border-b bg-white z-10 shadow-sm">
          <button onClick={() => setStatus('LEVEL_SELECT')} className="p-2 text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h2 className="font-black text-xl text-slate-900 tracking-tight">Level {currentLevel.id}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{currentLevel.gridSize}x{currentLevel.gridSize} Grid</p>
          </div>
          <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200 flex flex-col items-center min-w-[60px]">
            <span className={`text-xl font-black ${movesLeft <= 2 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
              {movesLeft}
            </span>
            <span className="text-[8px] uppercase font-bold text-slate-400 leading-none">Moves</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center relative">
        
        {status === 'MENU' && (
          <div className="flex flex-col items-center gap-10 text-center animate-in fade-in duration-700">
            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
              <span className="text-6xl">🎨</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900">Colour Print</h1>
              <p className="text-slate-500 font-medium">50,000 Levels Await</p>
            </div>
            <GameButton label="Enter Gallery" onClick={() => setStatus('LEVEL_SELECT')} fullWidth />
          </div>
        )}

        {status === 'LEVEL_SELECT' && (
          <div className="w-full h-full flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-20 space-y-4">
              <h2 className="text-3xl font-black tracking-tight px-2">Design Gallery</h2>
              <div className="flex gap-2 px-2">
                <input 
                  type="number"
                  placeholder="Jump to Level (1-50000)"
                  className="flex-1 p-3 rounded-xl border-2 border-slate-200 font-bold focus:border-slate-900 outline-none transition-all"
                  value={levelSearch}
                  onChange={(e) => setLevelSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const id = parseInt(levelSearch);
                      if (id >= 1 && id <= MAX_LEVEL_COUNT) startLevel(id);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const id = parseInt(levelSearch);
                    if (id >= 1 && id <= MAX_LEVEL_COUNT) startLevel(id);
                  }}
                  className="bg-slate-900 text-white p-3 rounded-xl font-bold active:scale-95"
                >
                  GO
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-20 px-2">
              {levelButtons.map(id => (
                <button
                  key={id}
                  onClick={() => startLevel(id)}
                  className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-slate-900 transition-all text-left group active:scale-95 h-32 flex flex-col justify-center"
                >
                  <span className="text-slate-400 text-xs font-bold block mb-1">DESIGN</span>
                  <span className="text-xl font-black group-hover:translate-x-1 inline-block transition-transform">#{id}</span>
                </button>
              ))}
              <button 
                onClick={() => setVisibleLevelCount(prev => Math.min(prev + 50, MAX_LEVEL_COUNT))}
                className="col-span-2 py-6 text-slate-500 font-black uppercase tracking-widest text-sm hover:text-slate-900"
              >
                Load More Designs...
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 pointer-events-none">
                <button 
                  onClick={() => setStatus('MENU')}
                  className="pointer-events-auto w-full py-4 text-slate-400 font-bold hover:text-slate-800 text-center"
                >
                  Back to Menu
                </button>
            </div>
          </div>
        )}

        {status === 'PLAYING' && currentLevel && (
          <div className="w-full space-y-6 max-w-sm">
            {/* Target Preview */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Design</span>
              <div className="w-32 h-32 p-1 bg-white rounded-2xl shadow-xl border-4 border-slate-100 transform -rotate-1 overflow-hidden">
                <Grid grid={currentLevel.target} onTileClick={() => {}} interactive={false} />
              </div>
            </div>

            {/* Hint text */}
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-center">
               <p className="text-amber-800 text-xs font-bold italic">💡 {currentLevel.hint}</p>
            </div>

            {/* Main Grid */}
            <Grid grid={grid} onTileClick={handleTileClick} />

            {/* Controls */}
            <div className="space-y-6 pt-2">
              <div className="flex justify-center gap-6 items-center">
                {currentLevel.availableColors.map(c => (
                  <ColorButton 
                    key={c} 
                    color={c} 
                    selected={selectedColor === c} 
                    onClick={() => setSelectedColor(c)} 
                  />
                ))}
              </div>
              <div className="flex justify-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                {currentLevel.availableTools.map(t => (
                  <ToolButton 
                    key={t} 
                    tool={t} 
                    selected={selectedTool === t} 
                    onClick={() => setSelectedTool(t)} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OVERLAYS */}
        {(status === 'WON' || status === 'LOST' || status === 'COMPLETED') && (
          <div className="absolute inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-8 text-white animate-in zoom-in duration-300">
            <div className="text-center w-full max-w-xs space-y-8">
              <div className="relative">
                <span className="text-8xl block animate-bounce">
                  {status === 'WON' ? '🌟' : status === 'LOST' ? '💧' : '👑'}
                </span>
                {status === 'WON' && <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-25">✨</div>}
              </div>
              <div>
                <h2 className="text-5xl font-black tracking-tighter">
                  {status === 'WON' ? 'Masterpiece!' : status === 'LOST' ? 'Smudged' : 'Complete!'}
                </h2>
                <p className="text-slate-400 mt-3 font-medium text-lg leading-tight">
                  {status === 'WON' && 'Your print is flawless. Ready for the next?'}
                  {status === 'LOST' && 'The ink ran dry. Re-think your layers!'}
                  {status === 'COMPLETED' && 'You have reached the pinnacle of Colour Print.'}
                </p>
              </div>
              <div className="space-y-3 pt-6">
                {status === 'WON' && <GameButton label="Next Design" onClick={nextLevel} fullWidth />}
                {(status === 'LOST' || status === 'COMPLETED') && <GameButton label="Try Again" onClick={reset} fullWidth />}
                <button 
                  onClick={() => setStatus('LEVEL_SELECT')}
                  className="w-full py-4 text-slate-400 font-black hover:text-white uppercase tracking-widest text-xs"
                >
                  Return to Gallery
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTION BAR */}
      {status === 'PLAYING' && (
        <div className="p-4 bg-white border-t flex justify-around items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={undo}
            disabled={history.length === 0 || undosLeft <= 0}
            className="flex-1 py-4 px-4 rounded-2xl border-2 border-slate-200 font-black text-sm text-slate-600 disabled:opacity-20 active:bg-slate-50 transition-all relative"
          >
            ↩ UNDO
            {undosLeft > 0 && (
              <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white font-black">
                {undosLeft}
              </span>
            )}
          </button>
          <button 
            onClick={reset}
            className="flex-1 py-4 px-4 rounded-2xl border-2 border-slate-200 font-black text-sm text-slate-600 active:bg-slate-50 transition-all"
          >
            🔄 RESET
          </button>
        </div>
      )}

      <div className="h-6 bg-white md:hidden" />
    </div>
  );
};

export default App;
