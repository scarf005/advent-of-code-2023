export const digit = /(\d+)/g
export const parseNums = (x: string): number[] => [...x.matchAll(digit)].map((x) => +x[0])
