// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import 'cypress-iframe';
import 'cypress-real-events';
import '@4tw/cypress-drag-drop';
import 'cypress-wait-until';

// Overrides the BROWSER's effective timezone at runtime via the Chrome DevTools Protocol.
// A real Chrome process only reads TZ once at launch, so this is the only way to exercise more
// than one browser timezone within a single test run without relaunching the browser --
// needed to prove a conversion uses the BROWSER's own timezone rather than some other fixed
// value that coincidentally produces the right answer once. `Emulation.setTimezoneOverride`
// needs no prior `Emulation.enable` (unlike some CDP Emulation commands); chromium-only,
// matching the existing Network.* CDP usage in support/e2e.js.
Cypress.Commands.add('setBrowserTimezone', timezoneId => {
    if (Cypress.browser.family !== 'chromium') {
        return;
    }

    cy.wrap(Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setTimezoneOverride',
        params: {timezoneId}
    }), {log: false});
});
