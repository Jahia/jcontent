// Type declarations for this repo's own custom commands, registered in ./commands.js.
// @jahia/cypress's commands are typed by its own package; this file is only for commands
// defined locally in jcontent's own test suite.
declare namespace Cypress {
    interface Chainable {
        // Overrides the browser's effective timezone at runtime via the Chrome DevTools
        // Protocol (chromium only; a no-op on other browser families). See commands.js.
        setBrowserTimezone(timezoneId: string): Chainable<unknown>;
    }
}
