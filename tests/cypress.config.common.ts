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
                },

                // Diagnostics logged with cy.log are captured by cypress-terminal-report, which is
                // configured onFail only, so anything logged during a PASSING test is discarded.
                // Numbers that are only meaningful when things go RIGHT — timings, retry counts —
                // need this instead: it runs in Node, so it reaches the runner's stdout and
                // survives in the archived CI log whatever the outcome.
                log(message) {
                    console.log(message);
                    return null;
                }
            });

            // Announced here, next to the registration, so the two cannot drift: the page objects
            // published in @jahia/jcontent-cypress fall back to cy.log unless a consumer's config
            // declares the 'log' task above, and this file is not part of the published package.
            config.env.jcontentCypressLogTask = true;

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
