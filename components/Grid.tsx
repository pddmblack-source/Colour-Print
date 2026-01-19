
import React from 'react';
import { Color, COLOR_MAP } from '../types';

interface GridProps {
  grid: Color[][];
  onTileClick: (r: number, c: number) => void;
  interactive?: boolean;
}

export const Grid: React.FC<GridProps> = ({ grid, onTileClick, interactive = true }) => {
  const size = grid.length;
  // Reduce padding/gap for larger grids to keep them fitting
  const gap = size > 6 ? 'gap-0.5' : 'gap-1';
  const padding = size > 6 ? 'p-1' : 'p-2';

  return (
    <div 
      className={`grid ${gap} ${padding} bg-slate-200 rounded-2xl shadow-inner mx-auto border-4 border-slate-300`}
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        aspectRatio: '1/1',
        maxWidth: '400px',
        width: '100%'
      }}
    >
      {grid.map((row, r) => 
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            onClick={() => interactive && onTileClick(r, c)}
            className={`
              canvas-tile rounded-sm shadow-sm border border-black/5 flex items-center justify-center
              ${interactive ? 'cursor-pointer active:scale-95 active:brightness-90' : ''}
            `}
            style={{ 
              backgroundColor: COLOR_MAP[cell],
              transition: 'background-color 0.2s ease-out'
            }}
          >
          </div>
        ))
      )}
    </div>
  );
};
