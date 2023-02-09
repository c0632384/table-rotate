const { execSync } = require('child_process');
const assert = require('assert');

describe('CLI end-to-end', () => {
  it('should not fail without arguments', () => {
    const result = execSync('node ./build/cli.js').toString();

    assert.equal(result, '');
  });

  it('should not fail for valid CSV file', () => {
    assert.doesNotThrow(() => {
      execSync('node ./build/cli.js ./test/mock/input-valid.csv');
    });
  });

  it('should fail with non-existent file', () => {
    assert.throws(() => {
      execSync('node ./build/cli.js ./test/mock/input-fake.csv');
    }, /ENOENT/);
  });

  it('should fail with non-CSV file', () => {
    assert.throws(() => {
      execSync('node ./build/cli.js ./test/mock/input-invalid-type.csv');
    }, /Invalid Record/);
  });

  it('should fail with invalid CSV file', () => {
    assert.throws(() => {
      execSync('node ./build/cli.js ./test/mock/input-invalid-csv.csv');
    }, /Invalid Record/);
  });
});
