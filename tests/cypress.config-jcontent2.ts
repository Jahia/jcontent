import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

// Shard 2 of 2 for the jcontent suite (see cypress/e2e/jcontent/shard2).
baseConfig.e2e.specPattern = ['cypress/e2e/jcontent/shard2/**/*.cy.ts'];

export default defineConfig(baseConfig);
