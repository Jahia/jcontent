import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

// Shard 1 of 2 for the contentEditor suite (see cypress/e2e/contentEditor/shard1).
baseConfig.e2e.specPattern = ['cypress/e2e/contentEditor/shard1/**/*.cy.ts'];

export default defineConfig(baseConfig);
