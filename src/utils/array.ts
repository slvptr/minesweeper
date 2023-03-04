export const coordsByIndex = (
  idx: number,
  matrixWidth: number,
  matrixHeight: number
) => {
  return {
    y: Math.floor(idx / matrixWidth) % matrixHeight,
    x: idx % matrixWidth,
  };
};

export const copyMatrix = <T>(matrix: T[][]): T[][] => {
  const copy: T[][] = [];
  matrix.forEach(row => copy.push([...row]));
  return copy;
};

export const cartesian = <T>(a: T[], b: T[]) =>
  a.flatMap(ai => b.map(bi => [ai, bi]));
