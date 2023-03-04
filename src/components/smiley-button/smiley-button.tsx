import './smiley-button.scss';
import { MouseEventHandler } from 'react';
import classNames from 'classnames';
import { GameState } from '../../models/enums';

type SmileyButtonProps = {
  gameState: GameState;
  isScared: boolean;
  onClick: MouseEventHandler<HTMLElement>;
  className?: string;
};

const getSmileyClassName = (
  gameState: GameState,
  isScared: boolean
): string => {
  const baseClass = 'smiley-icon';
  let stateClass = '';

  switch (gameState) {
    case GameState.WON:
      stateClass = `${baseClass}--won`;
      break;
    case GameState.GAME_OVER:
      stateClass = `${baseClass}--game-over`;
      break;
  }
  if (isScared) stateClass = `${baseClass}--scared`;

  return classNames(baseClass, stateClass);
};

export const SmileyButton = ({
  gameState,
  isScared,
  onClick,
  className,
}: SmileyButtonProps) => (
  <div
    className={classNames(className, getSmileyClassName(gameState, isScared))}
    onClick={onClick}
  />
);
