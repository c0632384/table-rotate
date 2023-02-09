const assert = require('assert');
const { TableService } = require('../../build/services/table-service.js');

const tracker = new assert.CallTracker();

const makeTable = (width = 0, height = 0) =>
  Array(width * height)
    .fill(0)
    .map(Math.random);

describe('TableService#isRotatable', () => {
  it('should return false for empty table', () => {
    assert.equal(TableService.isRotatable(makeTable(0, 0)), false);
  });

  it('should return false for 1x2 table', () => {
    assert.equal(TableService.isRotatable(makeTable(1, 2)), false);
  });

  it('should return true for 10x10 table', () => {
    assert.equal(TableService.isRotatable(makeTable(10, 10)), true);
  });
});

describe('TableService#getShiftMap', () => {
  it('should use cached LUT tables when available', () => {
    TableService.cacheShiftMap = tracker.calls(() => {}, 2);

    TableService.getShiftMap(0);
    TableService.getShiftMap(2);
    TableService.getShiftMap(5);

    TableService.getShiftMap(11);
    TableService.getShiftMap(30);

    tracker.verify();
  });
});

describe('TableService#rotateTable', () => {
  it('should return immediately when input is not rotatable', () => {
    const testTables = [makeTable(0, 0), makeTable(1, 2)];

    testTables.forEach((table) => {
      assert.equal(TableService.rotateTable(table), table);
    });
  });

  it('should return rotated table', () => {
    const testTables = [
      [[1], [1]],
      [
        [1, 2, 3, 4],
        [3, 1, 4, 2],
      ],
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 1, 2, 7, 5, 3, 8, 9, 6],
      ],
    ];

    testTables.forEach(([input, output]) => {
      assert.equal(
        JSON.stringify(TableService.rotateTable(input)),
        JSON.stringify(output)
      );
    });
  });

  Array(3)
    .fill(0)
    .forEach((_, index) => {
      const tableLength = Math.pow(10, index + 1);

      it(`should not throw at ${tableLength}x${tableLength}`, () => {
        const table = makeTable(tableLength, tableLength);
        const expectedFirstIndex = table[tableLength];

        assert.ok(TableService.rotateTable(table));
        assert.ok(table[0] === expectedFirstIndex);
      });
    });
});
