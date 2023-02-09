import fs from 'fs';
import CSVParse from 'csv-parse';
import { ProcessService } from './process-service';

type RecordListener = (record: Array<string>) => void;

export class CSVService {
  delimiter = ',';
  columns: Array<string>;

  stream: fs.ReadStream;
  parser: CSVParse.Parser;
  listeners: Array<RecordListener> = [];

  copy(source: CSVService) {
    this.delimiter = source.delimiter;
    this.columns = source.columns;
  }

  setColumns(columns: Array<string>) {
    this.columns = columns;
  }

  writeColumns(columns?: Array<string>) {
    this.setColumns(columns);

    this.writeRecord(this.columns);
  }

  readRecord(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.parser = CSVParse.parse({
        onRecord: this.onRecord.bind(this),
      });

      this.parser.on('readable', this.onReadable.bind(this));
      this.parser.on('end', resolve);
      this.parser.on('error', (error) => {
        this.onError(error);
        reject();
      });

      fs.createReadStream(path, { encoding: 'utf-8' }).pipe(this.parser);
    });
  }

  registerRecordListener(listener: RecordListener) {
    this.listeners.push(listener);
  }

  writeRecord(values: Array<unknown>) {
    if (values.length !== this.columns?.length) {
      throw Error(
        `CSVServiceClass.write - invalid number of columns, expected ${this.columns.length} but found ${values.length}`
      );
    }

    const rowsString: string = values
      .map((value) =>
        typeof value === 'object'
          ? `"${JSON.stringify(value)}"`.replace(/,/gi, ', ')
          : value
      )
      .join(this.delimiter);

    ProcessService.writeOutput(rowsString);
  }

  private onReadable() {
    while (this.parser.read() !== null);
  }

  private onRecord(record: Array<string>) {
    if (!this.columns) {
      // NOTE Read first row as a declaration of column names
      this.setColumns(record);

      return;
    }

    this.listeners.forEach((listener) => {
      listener(record);
    });
  }

  private onError(error: Error) {
    ProcessService.onError(error);
  }

  dispose() {
    if (this.parser) {
      this.parser.end();
    }

    if (this.stream) {
      this.stream.close();
    }

    this.listeners = [];
  }
}
