import { CSVService } from './services/csv-service';
import { ProcessService } from './services/process-service';
import { TableService } from './services/table-service';

(async () => {
  const targetFile = ProcessService.getArgument(0);

  if (!targetFile) {
    ProcessService.dispose();
  }

  const csvInput = new CSVService();
  const csvOutput = new CSVService();

  csvOutput.copy(csvInput);
  csvOutput.writeColumns(['id', 'json', 'is_valid']);

  csvInput.registerRecordListener(([id, json]) => {
    const table = JSON.parse(json);
    let result: Array<unknown>;
    const isRotatable = TableService.isRotatable(table);

    if (isRotatable) {
      result = TableService.rotateTable(table, false);
    } else {
      result = [];
    }

    csvOutput.writeRecord([id, result, isRotatable]);
  });

  await csvInput.readRecord(targetFile);

  csvInput.dispose();
  csvOutput.dispose();

  ProcessService.dispose();
})();
