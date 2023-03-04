import './scoreboard.scss';
import classNames from 'classnames';

type ScoreboardProps = {
  value: number;
  className?: string;
};

const getIconClassName = (value: number, digitIndex: number): string => {
  let digit = Math.floor(value / Math.pow(10, digitIndex)) % 10;
  if (value > 999) digit = 9;
  if (value < 0) digit = 0;
  const iconClassName = `scoreboard__icon--${digit}`;
  return classNames('scoreboard__icon', iconClassName);
};

export const Scoreboard = ({ value, className }: ScoreboardProps) => (
  <div className={classNames('scoreboard', className)}>
    <div className={getIconClassName(value, 2)} />
    <div className={getIconClassName(value, 1)} />
    <div className={getIconClassName(value, 0)} />
  </div>
);
