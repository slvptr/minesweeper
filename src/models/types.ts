import { CellMask, CellValue } from './enums';

export type Coords = {
  x: number;
  y: number;
};

export type GridUnit = {
  coords: Coords;
  cellValue: CellValue;
  cellMask: CellMask;
};

export type Grid = GridUnit[][];
