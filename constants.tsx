
import { Color, Tool, Level } from './types';
import { generateLevel } from './services/gameLogic';

// We now primarily use the generator, but can still define "Hero" levels here if needed.
export const GET_LEVEL = (id: number): Level => {
  return generateLevel(id);
};

export const MAX_LEVEL_COUNT = 50000;
