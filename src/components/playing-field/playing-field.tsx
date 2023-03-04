import './playing-field.scss';
import { MouseEventHandler, useEffect, useState } from 'react';
import { cartesian, coordsByIndex, copyMatrix } from '../../utils/array';
import { randomNumbers } from '../../utils/random';
import { Coords, Grid, GridUnit } from '../../models/types';
import { Cell } from '../cell';
import { Scoreboard } from '../scoreboard';
import { SmileyButton } from '../smiley-button';
import { CellMask, CellValue, GameState } from '../../models/enums';

const GRID_WIDTH = 16;
const GRID_HEIGHT = 16;
const BOMB_COUNT = 40;

const countBombsAround = (coords: Coords, field: Grid): number => {
  const { x, y } = coords;
  let result = 0;
  cartesian([-1, 0, 1], [-1, 0, 1]).forEach(([i, j]) => {
    const [x2, y2] = [x + j, y + i];
    const currentUnit = field[y2]?.[x2];
    if ((i === 0 && j === 0) || !currentUnit) return;
    if (currentUnit.cellValue == CellValue.BOMB) result++;
  });
  return result;
};

const countMarkedBombs = (
  field: Grid
): { markedAtAll: number; markedCorrectly: number } => {
  let markedAtAll = 0;
  let markedCorrectly = 0;
  for (let i = 0; i < GRID_HEIGHT; ++i) {
    for (let j = 0; j < GRID_WIDTH; ++j) {
      if (
        field[i][j].cellMask == CellMask.FLAG ||
        field[i][j].cellValue == CellValue.BOMB_MISTAKEN
      )
        markedAtAll++;
      if (
        field[i][j].cellMask == CellMask.FLAG &&
        field[i][j].cellValue == CellValue.BOMB
      )
        markedCorrectly++;
    }
  }
  return { markedAtAll, markedCorrectly };
};

const getFlagsCoords = (field: Grid): Coords[] => {
  const coords: Coords[] = [];
  for (let i = 0; i < GRID_HEIGHT; ++i) {
    for (let j = 0; j < GRID_WIDTH; ++j) {
      if (field[i][j].cellMask == CellMask.FLAG)
        coords.push(field[i][j].coords);
    }
  }
  return coords;
};

const expandNearbyNumbers = (coords: Coords, field: Grid): Grid => {
  cartesian([-1, 0, 1], [-1, 0, 1]).forEach(([i, j]) => {
    const [x2, y2] = [coords.x + j, coords.y + i];
    const currentUnit = field[y2]?.[x2];
    if ((i == 0 && j == 0) || !currentUnit) return;
    if (
      currentUnit.cellValue >= CellValue.ONE &&
      currentUnit.cellValue <= CellValue.EIGHT
    )
      currentUnit.cellMask = CellMask.NO;
  });
  return field;
};

const generateField = () => {
  const newField: Grid = Array.from({ length: GRID_HEIGHT }, (_, i) =>
    Array.from({ length: GRID_WIDTH }, (_, j) => ({
      coords: { x: j, y: i },
      cellValue: CellValue.EMPTY,
      cellMask: CellMask.LOCKED,
    }))
  );
  const bombIndexes = randomNumbers(
    0,
    GRID_WIDTH * GRID_HEIGHT - 1,
    BOMB_COUNT
  );
  bombIndexes.forEach(idx => {
    const { x, y } = coordsByIndex(idx, GRID_WIDTH, GRID_HEIGHT);
    newField[y][x].cellValue = CellValue.BOMB;
  });

  for (let i = 0; i < GRID_HEIGHT; ++i) {
    for (let j = 0; j < GRID_WIDTH; ++j) {
      if (newField[i][j].cellValue !== CellValue.EMPTY) continue;
      newField[i][j].cellValue += countBombsAround({ y: i, x: j }, newField);
    }
  }

  return newField;
};

const expandArea = (field: Grid, startCoords: Coords): Grid => {
  const { x, y } = startCoords;
  field[y][x].cellMask = CellMask.NO;
  if (field[y][x].cellValue != CellValue.EMPTY) return field;

  const queue: Coords[] = [startCoords];
  const expanded: Coords[] = [];

  while (queue.length > 0) {
    const coords = queue.shift() as Coords;
    expanded.push(coords);
    field[coords.y][coords.x].cellMask = CellMask.NO;
    cartesian([-1, 0, 1], [-1, 0, 1]).forEach(([i, j]) => {
      const [x2, y2] = [coords.x + j, coords.y + i];
      const currentUnit = field[y2]?.[x2];
      if (!currentUnit) return;
      if (
        currentUnit.cellValue == CellValue.EMPTY &&
        currentUnit.cellMask != CellMask.NO &&
        !queue.some(({ x, y }) => x == x2 && y == y2)
      ) {
        queue.push(currentUnit.coords);
      }
    });
  }
  expanded.forEach(coords => {
    expandNearbyNumbers(coords, field);
  });

  return field;
};

export const PlayingField = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.NOT_STARTED);
  const [field, setField] = useState<Grid>(generateField());
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [bombCounter, setBombCounter] = useState(BOMB_COUNT);
  const [time, setTime] = useState(0);
  const [isSmileyScared, setIsSmileyScared] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timer | undefined;
    if (gameState == GameState.STARTED) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const { markedAtAll, markedCorrectly } = countMarkedBombs(field);
    setBombCounter(BOMB_COUNT - markedAtAll);
    if (markedAtAll == markedCorrectly && markedCorrectly == BOMB_COUNT)
      setGameState(GameState.WON);
  }, [field]);

  const handleCellLeftClick = (coords: Coords) => {
    if (gameState != GameState.NOT_STARTED && gameState != GameState.STARTED)
      return;

    const { x, y } = coords;
    let newField: Grid = copyMatrix(field);

    if (isFirstClick) {
      setIsFirstClick(false);
      setGameState(GameState.STARTED);
      const flagsCoords = getFlagsCoords(field);

      while (newField[y][x].cellValue == CellValue.BOMB)
        newField = generateField();

      flagsCoords.forEach(({ x, y }) => {
        newField[y][x].cellMask = CellMask.FLAG;
      });
    }

    const currentUnit = newField[y][x];
    expandArea(newField, coords);

    if (currentUnit.cellValue == CellValue.BOMB) {
      setGameState(GameState.GAME_OVER);
      currentUnit.cellValue = CellValue.BOMB_EXPLODED;
      newField.forEach(row =>
        row.map(unit => {
          if (
            unit.cellValue != CellValue.BOMB &&
            unit.cellMask == CellMask.FLAG
          )
            unit.cellValue = CellValue.BOMB_MISTAKEN;

          if (
            unit.cellValue != CellValue.BOMB ||
            unit.cellMask != CellMask.FLAG
          )
            unit.cellMask = CellMask.NO;
        })
      );
    }
    setField(newField);
  };

  const handleCellRightClick = (coords: Coords) => {
    if (gameState != GameState.NOT_STARTED && gameState != GameState.STARTED)
      return;

    if (isFirstClick) setGameState(GameState.STARTED);

    const { x, y } = coords;
    const newField: Grid = copyMatrix(field);
    const currentUnit = newField[y][x];

    if (currentUnit.cellMask == CellMask.LOCKED)
      currentUnit.cellMask = CellMask.FLAG;
    else if (currentUnit.cellMask == CellMask.FLAG)
      currentUnit.cellMask = CellMask.LOCKED_QUESTION;
    else if (currentUnit.cellMask == CellMask.LOCKED_QUESTION)
      currentUnit.cellMask = CellMask.LOCKED;

    setField(newField);
  };

  const handleCellPressed = () => {
    if (gameState == GameState.STARTED) setIsSmileyScared(true);
  };
  const handleCellReleased = () => {
    setIsSmileyScared(false);
  };

  const onSmileyClick: MouseEventHandler<HTMLElement> = e => {
    setGameState(GameState.NOT_STARTED);
    setField(generateField());
    setIsFirstClick(true);
    setBombCounter(BOMB_COUNT);
    setTime(0);
  };

  return (
    <div className="playing-field">
      <section className="playing-field__top-section">
        <div className="left-angle" />
        <div className="horizontal-border" />
        <div className="right-angle" />
      </section>

      <section className="playing-field__control-section">
        <div className="left-border" />
        <div className="bar">
          <Scoreboard className="bar__bomb-counter" value={bombCounter} />
          <SmileyButton
            className="bar__smiley-button"
            gameState={gameState}
            isScared={isSmileyScared}
            onClick={onSmileyClick}
          />
          <Scoreboard className="bar__timer" value={time} />
        </div>
        <div className="right-border" />
      </section>

      <section className="playing-field__intermediate-section">
        <div className="left-cross" />
        <div className="horizontal-border" />
        <div className="right-cross" />
      </section>

      <section className="playing-field__middle-section">
        <div className="left-border" />
        <div className="grid">
          {([] as GridUnit[]).concat(...field).map(gridUnit => (
            <Cell
              key={`${gridUnit.coords.x}_${gridUnit.coords.y}`}
              gridUnit={gridUnit}
              handleLeftClick={handleCellLeftClick}
              handleRightClick={handleCellRightClick}
              handleCellPressed={handleCellPressed}
              handleCellReleased={handleCellReleased}
            />
          ))}
        </div>
        <div className="right-border" />
      </section>

      <section className="playing-field__bottom-section">
        <div className="left-angle" />
        <div className="horizontal-border" />
        <div className="right-angle" />
      </section>
    </div>
  );
};
