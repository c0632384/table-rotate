class ProcessServiceClass {
  command: string;
  args: Array<string> = [];

  constructor() {
    const argv = [...process.argv];

    // NOTE Ignore runtime
    argv.shift();

    this.command = argv.shift();
    this.args = argv;
  }

  getArgument(position: number): string {
    return this.args[position];
  }

  writeOutput(value: string) {
    console.log(value);
  }

  onError(error: Error) {
    throw error.message;
  }

  dispose() {
    process.exit(0);
  }
}

export const ProcessService = new ProcessServiceClass();
