export enum CellValue {
  EMPTY,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  BOMB,
  BOMB_EXPLODED,
  BOMB_MISTAKEN,
}

export enum GameState {
  NOT_STARTED,
  STARTED,
  GAME_OVER,
  WON,
}

export enum CellMask {
  NO,
  LOCKED,
  LOCKED_QUESTION,
  FLAG,
}
