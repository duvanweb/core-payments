import { register } from 'tsconfig-paths';
import path from 'path';

/**
 * Registers tsconfig path aliases at runtime so that compiled CommonJS
 * output can resolve @application/*, @infrastructure/*, @presentation/*.
 * Must be imported before any module that uses the aliases.
 */
register({
  baseUrl: path.resolve(__dirname),
  paths: {
    '@application/*': ['application/*'],
    '@infrastructure/*': ['infrastructure/*'],
    '@presentation/*': ['presentation/*'],
  },
});
