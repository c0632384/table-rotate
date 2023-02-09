"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVService = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parse_1 = __importDefault(require("csv-parse"));
const process_service_1 = require("./process-service");
class CSVService {
    constructor() {
        this.delimiter = ',';
        this.listeners = [];
    }
    copy(source) {
        this.delimiter = source.delimiter;
        this.columns = source.columns;
    }
    setColumns(columns) {
        this.columns = columns;
    }
    writeColumns(columns) {
        this.setColumns(columns);
        this.writeRecord(this.columns);
    }
    readRecord(path) {
        return new Promise((resolve, reject) => {
            this.parser = csv_parse_1.default.parse({
                onRecord: this.onRecord.bind(this)
            });
            this.parser.on('readable', this.onReadable.bind(this));
            this.parser.on('end', resolve);
            this.parser.on('error', (error) => {
                this.onError(error);
                reject();
            });
            fs_1.default.createReadStream(path, { encoding: 'utf-8' })
                .pipe(this.parser);
        });
    }
    registerRecordListener(listener) {
        this.listeners.push(listener);
    }
    writeRecord(values) {
        var _a;
        if (values.length !== ((_a = this.columns) === null || _a === void 0 ? void 0 : _a.length)) {
            throw Error(`CSVServiceClass.write - invalid number of columns, expected ${this.columns.length} but found ${values.length}`);
        }
        const rowsString = values
            .map(value => typeof value === 'object' ? `"${JSON.stringify(value)}"`.replace(/,/gi, ', ') : value)
            .join(this.delimiter);
        process_service_1.ProcessService.writeOutput(rowsString);
    }
    onReadable() {
        while (this.parser.read() !== null)
            ;
    }
    onRecord(record) {
        if (!this.columns) {
            // NOTE Read first row as a declaration of column names
            this.setColumns(record);
            return;
        }
        this.listeners.forEach((listener) => {
            listener(record);
        });
    }
    onError(error) {
        process_service_1.ProcessService.onError(error);
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
exports.CSVService = CSVService;
