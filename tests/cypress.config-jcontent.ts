import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

baseConfig.e2e.specPattern = ['cypress/e2e/jcontent/**/!(categoryManager).cy.ts'];

export default defineConfig(baseConfig);
