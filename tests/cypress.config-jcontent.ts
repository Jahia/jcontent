import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

// Shard 1 of 2 for the jcontent suite (see cypress/e2e/jcontent/shard1), plus the api specs.
baseConfig.e2e.specPattern = [
    'cypress/e2e/jcontent/shard1/**/compareStagingLive.cy.ts',
    'cypress/e2e/jcontent/shard1/**/!(compareStagingLive)*.cy.ts',
    'cypress/e2e/api/**/*.cy.ts'
];

export default defineConfig(baseConfig);
