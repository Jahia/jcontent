import * as fs from 'fs';

export const baseConfig = {
    chromeWebSecurity: false,
    defaultCommandTimeout: 20000,
    pageLoadTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json'
    },
    screenshotsFolder: './results/screenshots',
    video: true,
    videosFolder: './results/videos',
    viewportWidth: 1366,
    viewportHeight: 768,
    watchForFileChanges: false,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0,
    e2e: {
        specPattern: ['**/**.cy.ts'],
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            // Register tasks before other plugins to ensure they're available
            on('task', {
                readFileMaybe(filename) {
                    if (fs.existsSync(filename)) {
                        return fs.readFileSync(filename, 'utf8');
                    }

                    return null;
                }
            });

            // Clean up videos for passing tests
            on('after:spec', (spec, results) => {
                if (results?.video) {
                    const failures = results.tests.some(test =>
                        test.attempts.some(attempt => attempt.state === 'failed')
                    );
                    if (!failures) {
                        // Delete video asynchronously to avoid blocking
                        fs.promises.unlink(results.video).catch(() => {});
                    }
                }
            });

            // Load external plugins
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require('./cypress/plugins/index.js')(on, config);
        },
        excludeSpecPattern: ['**/*.ignore.ts', '**/*performance.cy.ts'],
        baseUrl: 'http://localhost:8080'
    }
};
