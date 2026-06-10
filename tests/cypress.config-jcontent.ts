import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

baseConfig.e2e.specPattern = ['cypress/e2e/jcontent/**/!(categoryManager).cy.ts', 'cypress/e2e/api/**/**.cy.ts'];

export default defineConfig(baseConfig);
