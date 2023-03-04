import './cell.scss';
import { Coords, GridUnit } from '../../models/types';
import classNames from 'classnames';
import { MouseEventHandler } from 'react';
import { CellMask, CellValue } from '../../models/enums';

type CellProps = {
  gridUnit: GridUnit;
  handleLeftClick: (coords: Coords) => void;
  handleRightClick: (coords: Coords) => void;
  handleCellPressed: () => void;
  handleCellReleased: () => void;
};

const getIconValueClassName = (gridUnit: GridUnit) => {
  const valueName = CellValue[gridUnit.cellValue]
    ?.toLowerCase()
    .replace('_', '-');
  const valueClass = `cell-icon--${valueName}`;
  return classNames('cell-icon', valueClass);
};

const getIconMaskClassName = (gridUnit: GridUnit) => {
  const maskName = CellMask[gridUnit.cellMask]?.toLowerCase().replace('_', '-');
  const maskClass = `cell-icon--${maskName}`;
  return classNames('cell-icon', maskClass);
};

export const Cell = ({
  gridUnit,
  handleLeftClick,
  handleRightClick,
  handleCellPressed,
  handleCellReleased,
}: CellProps) => {
  const onClick: MouseEventHandler = e => {
    handleLeftClick(gridUnit.coords);
  };

  const onContextMenu: MouseEventHandler = e => {
    handleRightClick(gridUnit.coords);
    e.preventDefault();
  };

  const onCellPressed: MouseEventHandler = e => {
    if (e.button != 0) return;
    handleCellPressed();
  };

  const onCellReleased: MouseEventHandler = e => {
    if (e.button != 0) return;
    handleCellReleased();
  };

  if (gridUnit.cellMask === CellMask.NO)
    return (
      <div className={getIconValueClassName(gridUnit)} onClick={onClick} />
    );

  return (
    <div
      className={getIconMaskClassName(gridUnit)}
      onClick={onClick}
      onMouseDown={onCellPressed}
      onMouseUp={onCellReleased}
      onMouseOut={onCellReleased}
      onContextMenu={onContextMenu}
    />
  );
};
