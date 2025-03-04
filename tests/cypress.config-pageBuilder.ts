import {defineConfig} from 'cypress';
import {baseConfig} from './cypress.config.common';

baseConfig.e2e.specPattern = [
    'cypress/e2e/pageBuilder/**/**.cy.ts',
    'cypress/e2e/jcontent/**/createContent.cy.ts',
    'cypress/e2e/jcontent/**/selection.cy.ts',
    'cypress/e2e/jcontent/**/compareStagingLive.cy.ts',
    'cypress/e2e/menuActions/**/areaActions.cy.ts',
];

export default defineConfig(baseConfig);
