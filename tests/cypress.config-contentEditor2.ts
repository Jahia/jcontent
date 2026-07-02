import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

// Shard 2 of 2 for the contentEditor suite (see cypress/e2e/contentEditor/shard2).
baseConfig.e2e.specPattern = ['cypress/e2e/contentEditor/shard2/**/*.cy.ts'];

export default defineConfig(baseConfig);
