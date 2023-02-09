# Library choice

Due to maintenance (based on activity / issues # / last commit) - went with [csv-parse](https://github.com/adaltas/node-csv) (actively maintained) over suggested [fast-csv](https://www.npmjs.com/package/fast-csv) (last updated 2 years ago) & [csv-stream](https://www.npmjs.com/package/csv-stream) (last updated 5 years ago).

Library API is still similar - just a matter of stability.

# `console.log` vs `stdout`

While `stdout` / `printf` may look a bit nicer - `console.log` has same functionality plus built-in parsing, which is the main reason it's used here as an alternative ([source](https://stackoverflow.com/questions/4976466/difference-between-process-stdout-write-and-console-log-in-node-js).)

# Performance / memory leaks

Tested on runtime-generated JSON arrays from `1x1` up until `1000x1000`.
Base sizes from `1x1` up until `10x10` are covered by an inline look-up table. If array is not covered by the inline LUT - new one is generated and cached.

## Shift map LUTs

Shift maps are sequential array indice lists that cover rings of the rotated table, ex.:

```
A A A A A
A B B B A
A B C B A
A B B B A
A A A A A
```

Shift map including sequence `A1, A2, A3,... An`, maps 2D array coordinates to a 1D array compatible with the input arrays.
Generation of a shiftmap is cheap, since it loops only over a single edge of the 2D array (remaining edges are symmetrical relative to the array centre.)

Max 25 LUT are cached in-memory. If this limit is exceeded within a single run - stored LUTs are overriden at random (could be removed based on repeatability - but not knowing the source of CSVs, assuming repeatability is meaningful can be risky. In case CSVs would be sorted by array size, cache would quickly become saturated.)

# Error cases

- All basic error cases should be handled: lack of input file, inproper input, incorrectly sized tables etc. (In case of an exception, expected behaviour is just a thrown error.)
- Input limitations: code uses ReadableStream pipes to stream input in and stdout as an output stream. While this may handle big file sizes, we still assume contents of each JSON row are within reason (otherwise [a separate JSON stream](https://www.npmjs.com/package/big-json) may be useful, or performing the rotation in a temporary file on the disk with only limited amounts of table in-memory.)
- Edge-cases tested with randomized sample data generated in-memory.
- Code written using TypeScript for runtime and static type safety.

# Code structure

- `cli.js`: Implements the actual logic of the tool using services.
- `services/process-service.ts`: Singleton indirectly controlling the runtime process.
- `services/csv-service.ts`: Instantiable service responsible for reading and parsing CSV files. Handles columns internally, calls `CSVService#registerRecordListener` for each read row.
- `services/table-service.ts`: Singleton capable of array rotation (could also be static.) Contains non-exported LUT in-memory cache.
