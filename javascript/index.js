import { callApi } from './api.js';
import yargs from 'yargs';

// call this script from the command line
// and pass in the text to be inferred
// e.g. node identifyDemo.js "John Smith is 45 years old."
if (require.main === module) {
  const argv = yargs
    .usage('Usage: $0 [options]')
    .option('t', {
      alias: 'text',
      describe: 'Text to be inferred',
      type: 'string',
      demandOption: true,
    })
    .option('m', {
      alias: 'model',
      describe: 'Model to use',
      enum: ['identify-phi', 'redact-phi', 'structure'],
      demandOption: true,
    }).argv;

  const model = argv.model;
  return await callApi(model, argv.text);
}
