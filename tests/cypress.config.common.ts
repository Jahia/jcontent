import * as fs from 'fs';

export const baseConfig = {
    chromeWebSecurity: false,
    defaultCommandTimeout: 5000,
    pageLoadTimeout: 30000,
    requestTimeout: 5000,
    responseTimeout: 7000,
    videoUploadOnPasses: false,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json'
    },
    screenshotsFolder: './results/screenshots',
    videosFolder: './results/videos',
    viewportWidth: 1366,
    viewportHeight: 768,
    watchForFileChanges: false,
    e2e: {
        specPattern: ['**/**.cy.ts'],
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            on('task', {
                readFileMaybe(filename) {
                    if (fs.existsSync(filename)) {
                        return fs.readFileSync(filename, 'utf8');
                    }

                    return null;
                }
            });
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('./cypress/plugins/index.js')(on, config);
        },
        excludeSpecPattern: ['**/*.ignore.ts'],
        baseUrl: 'http://localhost:8080'
    }
};