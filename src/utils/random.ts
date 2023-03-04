export const randomNumbers = (min: number, max: number, count: number) => {
  const uniqueNumbers = new Set<number>();
  while (uniqueNumbers.size < count) {
    uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(uniqueNumbers);
};
