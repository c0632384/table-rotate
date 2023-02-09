"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessService = void 0;
class ProcessServiceClass {
    constructor() {
        this.args = [];
        const argv = [...process.argv];
        // NOTE Ignore runtime
        argv.shift();
        this.command = argv.shift();
        this.args = argv;
    }
    getArgument(position) {
        return this.args[position];
    }
    writeOutput(value) {
        console.log(value);
    }
    onError(error) {
        throw error.message;
    }
    dispose() {
        process.exit(0);
    }
}
exports.ProcessService = new ProcessServiceClass();
