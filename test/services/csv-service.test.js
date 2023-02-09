const assert = require('assert');
const { CSVService } = require('../../build/services/csv-service.js');

const tracker = new assert.CallTracker();

describe('CSVService#copy', () => {
  it('should copy properties from one instance to another', () => {
    const serviceA = new CSVService();
    const serviceB = new CSVService();

    serviceA.delimiter = ':';
    serviceA.setColumns(['A', 'B', 'C']);

    assert.notEqual(serviceA.delimiter, serviceB.delimiter);
    assert.notEqual(serviceA.columns, serviceB.columns);

    serviceB.copy(serviceA);

    assert.equal(serviceA.delimiter, serviceB.delimiter);
    assert.equal(serviceA.columns, serviceB.columns);
  });
});

describe('CSVService#setColumns', () => {
  it('should set columns', () => {
    const serviceA = new CSVService();
    const testColumns = ['A', 'B', 'C'];

    serviceA.setColumns(testColumns);

    assert.equal(serviceA.columns, testColumns);
  });
});

describe('CSVService#setColumns', () => {
  it('should override existing columns in the instance', () => {
    const service = new CSVService();
    const testColumns = ['A', 'B', 'C'];

    service.writeColumns(testColumns);

    assert.equal(service.columns, testColumns);
  });

  it('should write columns out', () => {
    const service = new CSVService();

    service.writeRecord = tracker.calls(() => {}, 1);
    service.writeColumns([]);

    tracker.verify();
  });
});

describe('CSVService#readRecord', () => {
  // NOTE Internal-only
});

describe('CSVService#registerRecordListener', () => {
  it('should append a new listener to the instance', () => {
    const service = new CSVService();

    const mock = () => {};
    service.registerRecordListener(mock);

    assert.ok(service.listeners.includes(mock));
  });
});

describe('CSVService#writeRecord', () => {
  it('should write data out', () => {
    const service = new CSVService();
    service.setColumns(['id', 'name']);

    console.log = tracker.calls(() => {}, 1);
    service.writeRecord([1, 'John']);

    tracker.verify();
  });

  it('should throw when trying to write invalid data out', () => {
    const service = new CSVService();
    service.setColumns(['id', 'name']);

    assert.throws(() => {
      service.writeRecord([1]);
    }, /invalid number of columns/);
  });
});
