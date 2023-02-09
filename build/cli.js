"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const csv_service_1 = require("./services/csv-service");
const process_service_1 = require("./services/process-service");
const table_service_1 = require("./services/table-service");
(async () => {
    const targetFile = process_service_1.ProcessService.getArgument(0);
    if (!targetFile) {
        process_service_1.ProcessService.dispose();
        ;
    }
    const csvInput = new csv_service_1.CSVService();
    const csvOutput = new csv_service_1.CSVService();
    csvOutput.copy(csvInput);
    csvOutput.writeColumns(['id', 'json', 'is_valid']);
    csvInput.registerRecordListener(([id, json]) => {
        const table = JSON.parse(json);
        let result;
        const isRotatable = table_service_1.TableService.isRotatable(table);
        if (isRotatable) {
            result = table_service_1.TableService.rotateTable(table, false);
        }
        else {
            result = [];
        }
        csvOutput.writeRecord([
            id,
            result,
            isRotatable
        ]);
    });
    await csvInput.readRecord(targetFile);
    csvInput.dispose();
    csvOutput.dispose();
    process_service_1.ProcessService.dispose();
})();
