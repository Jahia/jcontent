import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

baseConfig.e2e.specPattern = ['cypress/e2e/performance/performance.cy.ts'];
baseConfig.e2e.excludeSpecPattern = ['**/*.ignore.ts'];

export default defineConfig(baseConfig);
