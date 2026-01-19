
export enum Color {
  Empty = 'white',
  Red = 'red',
  Blue = 'blue',
  Yellow = 'yellow',
  Orange = 'orange',
  Green = 'green',
  Purple = 'purple',
  Brown = 'brown',
  Black = 'black'
}

export enum Tool {
  Stamp = 'STAMP', // 1x1
  RollerH = 'ROLLER_H', // Row
  RollerV = 'ROLLER_V', // Col
  Spray = 'SPRAY' // 3x3
}

export interface Level {
  id: number;
  name: string;
  gridSize: number;
  target: Color[][];
  moves: number;
  availableColors: Color[];
  availableTools: Tool[];
  undos?: number;
  hint?: string; // Guidance for the player
}

export type GameStatus = 'PLAYING' | 'WON' | 'LOST' | 'MENU' | 'LEVEL_SELECT' | 'COMPLETED';

export const COLOR_MAP: Record<Color, string> = {
  [Color.Empty]: '#FFFFFF',
  [Color.Red]: '#FF3B30',
  [Color.Blue]: '#007AFF',
  [Color.Yellow]: '#FFCC00',
  [Color.Orange]: '#FF9500',
  [Color.Green]: '#34C759',
  [Color.Purple]: '#AF52DE',
  [Color.Brown]: '#A2845E',
  [Color.Black]: '#1C1C1E',
};

export function mixColors(base: Color, incoming: Color): Color {
  if (base === Color.Empty) return incoming;
  if (base === incoming) return base;

  const set = new Set([base, incoming]);

  // Primary Mixes
  if (set.has(Color.Red) && set.has(Color.Yellow)) return Color.Orange;
  if (set.has(Color.Red) && set.has(Color.Blue)) return Color.Purple;
  if (set.has(Color.Yellow) && set.has(Color.Blue)) return Color.Green;

  // Additive logic: If base already contains the color, don't muddy it
  if (base === Color.Orange && (incoming === Color.Red || incoming === Color.Yellow)) return Color.Orange;
  if (base === Color.Purple && (incoming === Color.Red || incoming === Color.Blue)) return Color.Purple;
  if (base === Color.Green && (incoming === Color.Yellow || incoming === Color.Blue)) return Color.Green;

  // Muddy mix
  return Color.Brown;
}
