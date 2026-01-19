
import { Color, Tool, mixColors, Level } from '../types';

export function createEmptyGrid(size: number): Color[][] {
  return Array(size).fill(null).map(() => Array(size).fill(Color.Empty));
}

export function applyTool(
  grid: Color[][],
  tool: Tool,
  color: Color,
  row: number,
  col: number
): Color[][] {
  const newGrid = grid.map(r => [...r]);
  const size = grid.length;

  switch (tool) {
    case Tool.Stamp:
      if (row >= 0 && row < size && col >= 0 && col < size) {
        newGrid[row][col] = mixColors(newGrid[row][col], color);
      }
      break;

    case Tool.RollerH:
      if (row >= 0 && row < size) {
        for (let c = 0; c < size; c++) {
          newGrid[row][c] = mixColors(newGrid[row][c], color);
        }
      }
      break;

    case Tool.RollerV:
      if (col >= 0 && col < size) {
        for (let r = 0; r < size; r++) {
          newGrid[r][col] = mixColors(newGrid[r][col], color);
        }
      }
      break;

    case Tool.Spray:
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            newGrid[nr][nc] = mixColors(newGrid[nr][nc], color);
          }
        }
      }
      break;
  }

  return newGrid;
}

export function checkWin(current: Color[][], target: Color[][]): boolean {
  if (current.length !== target.length) return false;
  for (let r = 0; r < target.length; r++) {
    for (let c = 0; c < target[0].length; c++) {
      if (current[r][c] !== target[r][c]) return false;
    }
  }
  return true;
}

/**
 * Advanced Procedural Generator for "Strong" levels.
 * Complexity scales logarithmically and linearly across 50k levels.
 */
export function generateLevel(id: number): Level {
  // Deterministic seed based on Level ID
  let seedValue = id * 15485863; // A large prime
  const seededRandom = () => {
    seedValue = (seedValue * 16807) % 2147483647;
    return (seedValue - 1) / 2147483646;
  };

  // 1. Determine Grid Size (Scales 3 -> 8)
  let gridSize = 3;
  if (id > 10) gridSize = 4;
  if (id > 100) gridSize = 5;
  if (id > 1000) gridSize = 6;
  if (id > 5000) gridSize = 7;
  if (id > 20000) gridSize = 8;

  // 2. Determine Layering Steps (Scales 2 -> 40)
  // Base steps + scaling factor based on level range
  const baseSteps = 2;
  const scalingFactor = Math.floor(Math.log10(id) * 8); 
  const steps = Math.min(baseSteps + scalingFactor, 40);

  // 3. Available Palette
  const colors = [Color.Red, Color.Blue, Color.Yellow];
  if (id > 50) colors.push(Color.Black);
  
  // 4. Available Tools
  const tools = [Tool.Stamp, Tool.RollerH, Tool.RollerV];
  if (id > 5) tools.push(Tool.Spray);

  // 5. Generate Target Pattern
  // We simulate a perfect "play-through" to ensure solvability
  let target = createEmptyGrid(gridSize);
  for (let i = 0; i < steps; i++) {
    const rCol = colors[Math.floor(seededRandom() * colors.length)];
    const rTool = tools[Math.floor(seededRandom() * tools.length)];
    const rRow = Math.floor(seededRandom() * gridSize);
    const rColIdx = Math.floor(seededRandom() * gridSize);
    target = applyTool(target, rTool, rCol, rRow, rColIdx);
  }

  // 6. Set Difficulty
  // Moves are tight: steps + a small buffer that decreases at high levels
  const buffer = id > 1000 ? 1 : 3;
  const moves = steps + buffer;

  const difficultyNames = [
    "Beginner", "Apprentice", "Journeyman", "Artisan", 
    "Expert", "Master", "Grandmaster", "Legend"
  ];
  const diffIndex = Math.min(Math.floor(Math.log10(id) * 1.5), difficultyNames.length - 1);

  return {
    id,
    name: `${difficultyNames[diffIndex]} #${id}`,
    gridSize,
    target,
    moves,
    availableColors: colors,
    availableTools: tools,
    undos: Math.max(10 - Math.floor(id / 500), 2),
    hint: id <= 5 
      ? "Layer primary colors to create new ones!" 
      : `Level ${id}: A ${gridSize}x${gridSize} pattern requiring ${steps} precise layers.`
  };
}
