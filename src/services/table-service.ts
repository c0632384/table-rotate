type ShiftMap = Array<Array<number>>;

const shiftMapLUT: Record<number, ShiftMap> = {
  0: [], // 0x0
  1: [[0]], // 1x1
  2: [[0, 1, 3, 2]], // 2x2
  3: [[0, 1, 2, 5, 8, 7, 6, 3], [4]], // 3x3
  4: [
    [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4],
    [5, 6, 10, 9],
  ], // 4x4
  5: [
    [0, 1, 2, 3, 4, 9, 14, 19, 24, 23, 22, 21, 20, 15, 10, 5],
    [6, 7, 8, 13, 18, 17, 16, 11],
    [12],
  ], // 5x5,
  6: [
    [0, 1, 2, 3, 4, 5, 11, 17, 23, 29, 35, 34, 33, 32, 31, 30, 24, 18, 12, 6],
    [7, 8, 9, 10, 16, 22, 28, 27, 26, 25, 19, 13],
    [14, 15, 21, 20],
  ], // 6x6
  7: [
    [
      0, 1, 2, 3, 4, 5, 6, 13, 20, 27, 34, 41, 48, 47, 46, 45, 44, 43, 42, 35,
      28, 21, 14, 7,
    ],
    [8, 9, 10, 11, 12, 19, 26, 33, 40, 39, 38, 37, 36, 29, 22, 15],
    [16, 17, 18, 25, 32, 31, 30, 23],
    [24],
  ], // 7x7
  8: [
    [
      0, 1, 2, 3, 4, 5, 6, 7, 15, 23, 31, 39, 47, 55, 63, 62, 61, 60, 59, 58,
      57, 56, 48, 40, 32, 24, 16, 8,
    ],
    [
      9, 10, 11, 12, 13, 14, 22, 30, 38, 46, 54, 53, 52, 51, 50, 49, 41, 33, 25,
      17,
    ],
    [18, 19, 20, 21, 29, 37, 45, 44, 43, 42, 34, 26],
    [27, 28, 36, 35],
  ], // 8x8
  9: [
    [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 17, 26, 35, 44, 53, 62, 71, 80, 79, 78, 77, 76,
      75, 74, 73, 72, 63, 54, 45, 36, 27, 18, 9,
    ],
    [
      10, 11, 12, 13, 14, 15, 16, 25, 34, 43, 52, 61, 70, 69, 68, 67, 66, 65,
      64, 55, 46, 37, 28, 19,
    ],
    [20, 21, 22, 23, 24, 33, 42, 51, 60, 59, 58, 57, 56, 47, 38, 29],
    [30, 31, 32, 41, 50, 49, 48, 39],
    [40],
  ], // 9x9
  10: [
    [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 19, 29, 39, 49, 59, 69, 79, 89, 99, 98, 97,
      96, 95, 94, 93, 92, 91, 90, 80, 70, 60, 50, 40, 30, 20, 10,
    ],
    [
      11, 12, 13, 14, 15, 16, 17, 18, 28, 38, 48, 58, 68, 78, 88, 87, 86, 85,
      84, 83, 82, 81, 71, 61, 51, 41, 31, 21,
    ],
    [
      22, 23, 24, 25, 26, 27, 37, 47, 57, 67, 77, 76, 75, 74, 73, 72, 62, 52,
      42, 32,
    ],
    [33, 34, 35, 36, 46, 56, 66, 65, 64, 63, 53, 43],
    [44, 45, 55, 54],
  ], // 10x10
};
const shiftMapLUTLimit = 25;

class TableServiceClass {
  isRotatable(table: Array<unknown>): boolean {
    return table.length && Number.isInteger(Math.sqrt(table.length));
  }

  getShiftMap(rowLength: number): ShiftMap {
    if (shiftMapLUT[rowLength]) {
      return shiftMapLUT[rowLength];
    }

    const depthLevels = Math.ceil(rowLength / 2.0);

    const getDepthOffset = (depth: number): number => {
      if (depth === 0.0) {
        return 0.0;
      }

      return getDepthOffset(depth - 1.0) + 1.0 + rowLength;
    };

    const shiftMap: Array<Array<number>> = Array(depthLevels)
      .fill(0)
      .map((_, level) => {
        const depth = getDepthOffset(level);
        const edgeRingLength = rowLength - level * 2.0;
        const edges: Array<Array<number>> = [[], [], [], []];

        if (edgeRingLength === 1) {
          return [depth];
        }

        for (let i = 0; i < edgeRingLength - 1; i++) {
          edges[0].push(depth + i);
          edges[1].push(depth + (edgeRingLength - 1) + rowLength * i);
          edges[2].push(
            depth + (edgeRingLength - 1) * rowLength + (edgeRingLength - 1) - i
          );
          edges[3].push(
            depth + (edgeRingLength - 1) * rowLength - rowLength * i
          );
        }

        return [...edges[0], ...edges[1], ...edges[2], ...edges[3]];
      });

    this.cacheShiftMap(rowLength, shiftMap);

    return shiftMap;
  }

  private cacheShiftMap(shiftMapKey: number, shiftMap: ShiftMap) {
    const cachedKeys = Object.keys(shiftMapLUT);

    if (cachedKeys.length >= shiftMapLUTLimit) {
      delete shiftMapLUT[Math.floor(Math.random() * cachedKeys.length)];
    }

    shiftMapLUT[shiftMapKey] = shiftMap;
  }

  rotateTable(
    table: Array<unknown>,
    counterClockwise = false
  ): Array<unknown> {
    if (!this.isRotatable(table)) {
      return table;
    }

    const rowLength = Math.sqrt(table.length);
    const shiftMap = this.getShiftMap(rowLength);

    shiftMap.forEach((edgeRing) => {
      if (counterClockwise) {
        const cachedInitialField = table[edgeRing[0]];

        for (let i = 0; i < edgeRing.length - 1; i++) {
          table[edgeRing[i]] = table[edgeRing[i + 1]];
        }

        table[edgeRing[edgeRing.length - 1]] = cachedInitialField;
      } else {
        const cachedInitialField = table[edgeRing[edgeRing.length - 1]];

        for (let i = edgeRing.length - 1; i >= 1; i--) {
          table[edgeRing[i]] = table[edgeRing[i - 1]];
        }

        table[edgeRing[0]] = cachedInitialField;
      }
    });

    return table;
  }
}

export const TableService = new TableServiceClass();
