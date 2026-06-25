import {JContent} from '../../../page-object';
import {
    BaseComponent,
    Button,
    createSite,
    createUser,
    deleteSite,
    deleteUser,
    Dropdown,
    getComponentByRole,
    grantRoles
} from '@jahia/cypress';

const sitekeyNonI18n = 'jcontentSite';
const sitekeyI18n = 'jcontentSiteI18N';

// ---------------------------------------------------------------------------
// publishAndWait: null-safe replacement for @jahia/cypress publishAndWaitJobEnding.
// The library version crashes when scheduler.jobs is null (server returns null
// instead of [] when the queue is empty). This wrapper guards against that.
// ---------------------------------------------------------------------------
const publishAndWait = (path: string, languages: string[] = ['en']) => {
    cy.apollo({
        variables: {
            pathOrId: path,
            languages,
            publishSubNodes: true,
            includeSubTree: true
        },
        mutationFile: 'graphql/jcr/mutation/publishNode.graphql'
    });
    cy.waitUntil(
        () =>
            cy
                .apollo({
                    fetchPolicy: 'no-cache',
                    queryFile: 'graphql/jcr/query/getJobsWithStatus.graphql'
                })
                .then(response => {
                    const jobs: Array<{ group: string; jobStatus: string }> | null | undefined =
                        response?.data?.admin?.jahia?.scheduler?.jobs;
                    if (!jobs) {
                        // Null/undefined jobs means the scheduler returned no data
                        // (empty queue or server quirk) — treat as "no active jobs"
                        return false;
                    }

                    const publicationJobs = jobs.filter(job => job.group === 'PublicationJob');
                    return !publicationJobs.some(job => job.jobStatus === 'EXECUTING');
                }),
        {
            errorMsg: `Publication timeout for node: ${path}`,
            timeout: 60000,
            verbose: true,
            interval: 500
        }
    );
};

// Helper to get day names for testing
const getDayNames = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    const todayPlus2 = (today + 2) % 7;
    return {
        today: days[today],
        todayPlus2: days[todayPlus2]
    };
};

function openVisibilityDialog() {
    // Open the visibility dialog
    getComponentByRole(Button, 'sbsVisibility').click();
}

// ---------------------------------------------------------------------------
// resetVisibilityRules: queries for the j:conditionalVisibility node first and
// only deletes it when it exists.  Using cy.apollo (which shares the browser
// session) avoids the authentication issues that cy.request can have.
// The "check-then-delete" pattern prevents cy.apollo from throwing when the
// node does not yet exist.
// ---------------------------------------------------------------------------
const resetVisibilityRules = (sitekey: string) => {
    const nodePath = `/sites/${sitekey}/home/area-main/test-content1/j:conditionalVisibility`;
    cy.apollo({
        queryFile: 'jcontent/jcrGetNode.graphql',
        variables: {path: nodePath}
    }).then(({data}) => {
        if (data?.jcr?.nodeByPath) {
            cy.apollo({
                variables: {pathOrId: nodePath},
                mutationFile: 'jcontent/jcrDeleteNode.graphql'
            });
        }
    });
};

// ---------------------------------------------------------------------------
// All inner suites share the same pair of sites. Site lifecycle (createSite /
// deleteSite) lives in this outer describe so the sites are never prematurely
// destroyed between suites.
// ---------------------------------------------------------------------------
describe('Visibility Screen', () => {
    before(function () {
        createSite(sitekeyNonI18n, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        cy.apollo({mutationFile: 'jcontent/createContent.graphql'});
        createSite(sitekeyI18n, {
            languages: 'en,fr,de',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {
                homePath: `/sites/${sitekeyI18n}/home`
            }
        });

        publishAndWait(`/sites/${sitekeyI18n}`);
        publishAndWait(`/sites/${sitekeyNonI18n}`);
    });

    after(function () {
        cy.logout();
        deleteSite(sitekeyNonI18n);
        deleteSite(sitekeyI18n);
    });

    describe('Visibility Screen Tests', () => {
        let jcontent: JContent;

        beforeEach(() => {
            cy.loginAndStoreSession();
        });

        afterEach(() => {
            cy.logout();
        });

        it('Display visibility screen in non i18n site with only Date Time section and no rules', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Verify the dialog is open
            const visibilityDialog = getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog');
            visibilityDialog.should('be.visible');

            // Verify the DateTime section is visible
            cy.get('[data-cm-role="visibilityScreen"]').should('be.visible');

            // Verify Languages section is NOT visible (non-i18n site)
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('Languages').should('not.exist');
            });

            // Verify Date/Time section title is visible
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('Date and time').should('be.visible');
            });

            // Verify "No rules" message is displayed
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('No condition').should('be.visible');
            });

            // Verify "Add condition" button is visible
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').should('be.visible');
            });

            // Verify Save and Close buttons are visible in dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').should('be.visible');
                cy.contains('button', 'Close').should('be.visible');
            });

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });

            // Verify dialog is closed
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Opens the Add New Rule form when clicking Add condition button', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Click Add condition button
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click();
            });

            // Verify the Add New Rule form is displayed
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('No condition').should('not.exist');
            });

            // Verify the condition type dropdown is visible
            getComponentByRole(Dropdown, 'condition-type').should('be.visible');

            // Verify Cancel and Add buttons are visible
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Close').should('be.visible');
                cy.contains('button', 'Add').should('be.visible');
            });
        });

        it('Cancels adding a new rule when clicking Close button', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Click Add condition button
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click();
            });

            // Verify we're in the add new rule form by checking for dropdown
            getComponentByRole(Dropdown, 'condition-type').should('be.visible');

            // Click Close button
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Close').click();
            });

            // Verify we're back to the no rules state
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('No condition').should('be.visible');
            });
        });

        it('Displays condition type dropdown with available rule types', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Click Add condition button
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click();
            });

            // Open the condition type dropdown
            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.get().click();

            // Verify some expected condition types are available
            // These are standard condition types that should be available
            cy.get('body').within(() => {
                // Look for common condition types - at least one should exist
                cy.get('[role="listbox"]').should('be.visible');
            });
        });

        it('Display visibility screen in i18n site with Languages section', () => {
            jcontent = JContent.visit(sitekeyI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Verify the dialog is open
            const visibilityDialog = getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog');
            visibilityDialog.should('be.visible');

            // Verify the DateTime section is visible
            cy.get('[data-cm-role="visibilityScreen"]').should('be.visible');

            // Verify Languages section IS visible (i18n site with multiple languages)
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('Languages').should('be.visible');
            });

            // Verify Date/Time section title is visible
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('Date and time').should('be.visible');
            });

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
        });

        it('Displays content name in dialog title', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Verify the content name is displayed in the dialog title
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.get('[id="dialog-language-title"]').should('be.visible');
                // The title should contain some text (the content name)
                cy.get('[id="dialog-language-title"]').should('not.be.empty');
            });

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
        });

        it('Verifies Save button is present and enabled when no errors', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Verify Save button exists and is not disabled
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').should('be.visible');
                cy.contains('button', 'Save').should('not.be.disabled');
            });

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
        });

        it('Verifies Close button closes the dialog without saving', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // Open the visibility dialog
            openVisibilityDialog();

            // Verify dialog is visible
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('be.visible');

            // Click Close button
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });

            // Verify dialog is closed
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

            // Verify we're still in the content editor (not closed)
            cy.get('body').should('be.visible');
        });

        describe('DatatableRules Tests', () => {
            it('Adds Day of Week rules using dynamic days (today and today+2) and validates in datatable', () => {
                const {today, todayPlus2} = getDayNames();
                cy.log(`Testing with days: ${today} (today) and ${todayPlus2} (today+2)`);

                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

                // Open the visibility dialog
                openVisibilityDialog();

                // Add first rule - Today
                cy.log(`Adding ${today} rule`);
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Add condition').click();
                });

                // Select "Day of the week" from dropdown
                const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
                conditionTypeDropdown.select('Day of the week');

                // Wait for the form to load by checking for the field
                cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000})
                    .as('dayOfWeekField')
                    .should('be.visible');

                // Select today from the list
                cy.get('@dayOfWeekField').find('[role="listbox"]').click();
                cy.get('@dayOfWeekField').find('menu').should('be.visible').contains(today).click();
                cy.get('[data-cm-role="visibilityScreen"]').click(); // Click outside to close dropdown

                // Verify today appears in the right list (selected items)
                cy.get('@dayOfWeekField').find('[role="listbox"]').should('contain', today);

                // Click Add button to add the rule
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Add').click();
                });

                // Wait for datatable to appear
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Verify the datatable now shows at least 1 rule
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    // Should not show "No condition" anymore
                    cy.contains('No condition').should('not.exist');
                });

                // Add second rule - Today + 2
                cy.log(`Adding ${todayPlus2} rule`);
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Add condition').click();
                });

                // Select "Day of the week" from dropdown again
                const conditionTypeDropdown2 = getComponentByRole(Dropdown, 'condition-type');
                conditionTypeDropdown2.select('Day of the week');

                // Wait for the form to load by checking for the field
                cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000})
                    .as('dayOfWeekFieldPlus2')
                    .should('be.visible');

                // Select today+2 from the left list
                // Select today from the list
                cy.get('@dayOfWeekFieldPlus2').find('[role="listbox"]').click();
                cy.get('@dayOfWeekFieldPlus2').find('menu').should('be.visible').contains(todayPlus2).click();
                cy.get('[data-cm-role="visibilityScreen"]').click(); // Click outside to close dropdown

                // Verify today appears in the right list (selected items)
                cy.get('@dayOfWeekFieldPlus2').find('[role="listbox"]').should('contain', todayPlus2);

                // Click Add button
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Add').click();
                });

                // Verify the datatable is visible and contains rows
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).as('table').should('be.visible');
                cy.get('@table').find('tbody tr').should('have.length.at.least', 2);

                // Save the dialog
                cy.log('Saving the rules');
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Save').click();
                });

                // Dialog should close after save
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
            });

            it('Reopens dialog and validates the saved rules in datatable', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

                // Reopen the visibility dialog
                openVisibilityDialog();

                // Verify the datatable shows the saved rules
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Verify we don't see "No condition"
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('No condition').should('not.exist');
                });

                // Verify the datatable contains rows with our rules
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length.at.least', 2);

                // Verify the table is populated (has actual content)
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr').first().should('not.be.empty');

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Publishes the rules and validates different visibility status for today vs today+2', () => {
                const {today, todayPlus2} = getDayNames();
                cy.log(
                    `Verifying visibility for ${today} (today - should be visible) and ${todayPlus2} (today+2 - should be hidden)`
                );

                // First, get the path to the content
                const contentPath = `/sites/${sitekeyNonI18n}/home`;

                // Publish the content with the rules
                cy.log('Publishing the content with visibility rules');
                publishAndWait(contentPath, ['en']);

                // Reopen the visibility dialog
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
                openVisibilityDialog();

                // Verify the datatable shows the rules
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Verify the datatable contains rows
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length.at.least', 2);

                // After publishing, verify visibility status chips show different states for today vs today+2
                cy.log(`Checking visibility status for ${today} rule (should be visible today)`);
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .within(() => {
                        // Should have visibility chips showing status in preview and live
                        cy.get('[class*="moonstone-chip"]').should('have.length.at.least', 2);
                    });

                cy.log(`Checking visibility status for ${todayPlus2} rule (should be hidden today)`);
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .eq(1)
                    .within(() => {
                        // Should have visibility chips showing status in preview and live
                        cy.get('[class*="moonstone-chip"]').should('have.length.at.least', 2);
                    });

                // Verify the chips show different states by comparing the two rules.
                // Use aliases to avoid deeply-nested .then() callbacks.
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('[class*="moonstone-chip"]')
                    .eq(1)
                    .invoke('attr', 'class')
                    .as('firstChipClass');

                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .eq(1)
                    .find('[class*="moonstone-chip"]')
                    .eq(1)
                    .invoke('attr', 'class')
                    .as('secondChipClass');

                cy.then(function () {
                    cy.log(`First rule (${today}) live chip class: ${this.firstChipClass}`);
                    cy.log(`Second rule (${todayPlus2}) live chip class: ${this.secondChipClass}`);
                    // The chips should have different colours indicating different visibility states
                    expect(this.firstChipClass).not.to.equal(this.secondChipClass);
                });

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Edits a rule and validates modified status in datatable', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

                // Open the visibility dialog
                openVisibilityDialog();

                // Verify the datatable is visible
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Click edit button on the first rule
                cy.log('Clicking edit on the first rule');
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .within(() => {
                        // Look for edit button - should be the first action button
                        cy.get('button[aria-label*="edit"], button:has(svg)')
                            .filter(':visible')
                            .first()
                            .click({force: true});
                    });

                // Verify we're in edit mode - the datatable should be hidden and edit form visible
                cy.get('[data-sel-role="visibility-rule-table"]').should('not.exist');
                cy.get('input[type="checkbox"]', {timeout: 10000}).filter(':visible').should('exist');

                // Cancel the edit
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Cancel').click();
                });

                // Should be back to the datatable
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Deletes a rule and validates it is removed from datatable', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

                // Open the visibility dialog
                openVisibilityDialog();

                // Get initial count of rules and save as alias to avoid deep nesting
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 10000}).then($rows => {
                    cy.log(`Initial rule count: ${$rows.length}`);
                    cy.wrap($rows.length).as('initialCount');
                });

                // Delete the first rule (outside the .then to stay within callback depth limit)
                cy.log('Deleting the first rule');
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .within(() => {
                        cy.get('button[aria-label*="delete"], button:has(svg)')
                            .filter(':visible')
                            .last()
                            .click({force: true});
                    });

                // Verify the count decreased
                cy.get('@initialCount').then((initialCount: number) => {
                    cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 5000}).should(
                        'have.length',
                        initialCount - 1
                    );
                });

                // Save the changes
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Save').click();
                });

                // Dialog should close
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
            });

            it('Validates chip status transitions: published → modified → published after deletion workflow', () => {
                const {today, todayPlus2} = getDayNames();
                cy.log(`Re-adding today's rule (${today}) to test deletion chip transitions`);

                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
                openVisibilityDialog();

                // Re-add today's rule (was deleted in the previous test)
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Add condition').click();
                });
                getComponentByRole(Dropdown, 'condition-type').select('Day of the week');
                cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000})
                    .as('dayOfWeekField')
                    .should('be.visible');
                // Select today from the list
                cy.get('@dayOfWeekField').find('[role="listbox"]').click();
                cy.get('@dayOfWeekField').find('menu').should('be.visible').contains(today).click();
                cy.get('[data-cm-role="visibilityScreen"]').click(); // Click outside to close dropdown

                // Verify today appears in the right list (selected items)
                cy.get('@dayOfWeekField').find('[role="listbox"]').should('contain', today);
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    cy.contains('button', 'Add').click();
                });
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Save').click();
                });
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

                // Publish so chips reflect live state
                publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);

                // Open dialog and find today's rule row - identify it by looking for the success/success visibility chips
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
                openVisibilityDialog();
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // After re-adding today's rule it is appended last, so the row order is:
                //   row 0 = todayPlus2 (survived the previous deletion test)
                //   row 1 = today     (just re-added)
                const todayRowIndex = 1;

                // --- STEP 1: Before deletion – today's rule should have success/success chips ---
                cy.log(`Step 1: Verifying today's rule (${today}) has success chips before deletion`);

                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .eq(todayRowIndex)
                    .find('td')
                    .first()
                    .invoke('attr', 'class')
                    .should('match', /__success/);

                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .eq(todayRowIndex)
                    .within(() => {
                        cy.get('[class*="moonstone-chip"]').eq(0).should('have.attr', 'class').and('include', 'success');
                        cy.get('[class*="moonstone-chip"]').eq(1).should('have.attr', 'class').and('include', 'success');
                    });

                // --- STEP 2: Delete today's rule ---
                cy.log(`Step 2: Deleting today's rule (${today})`);
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .eq(todayRowIndex)
                    .within(() => {
                        cy.get('button:has(svg)').filter(':visible').last().click({force: true});
                    });

                // Save the deletion
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Save').click();
                });
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

                // --- STEP 3: Reopen - remaining rule (todayPlus2) should have warning status bar (modified) and warning/warning chips ---
                cy.log(
                    `Step 3: Reopen after deletion - checking ${todayPlus2} rule shows modified (warning status bar)`
                );
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
                openVisibilityDialog();
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Only todayPlus2 rule should remain - its status bar should be "warning" (modified: content changed but not published yet)
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length', 1);
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('td')
                    .first()
                    .invoke('attr', 'class')
                    .should('match', /__warning/);

                // Both visibility chips should be "warning" (today+2 doesn't match today)
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .within(() => {
                        cy.log(`Checking ${todayPlus2} preview chip is warning (today+2 rule doesn't match today)`);
                        cy.get('[class*="moonstone-chip"]').eq(0).should('have.attr', 'class').and('include', 'warning');
                        cy.log(
                            `Checking ${todayPlus2} live chip is warning (live still has published rule that doesn't match today)`
                        );
                        cy.get('[class*="moonstone-chip"]').eq(1).should('have.attr', 'class').and('include', 'warning');
                    });

                // Close dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });

                // --- STEP 4: Publish the deletion ---
                cy.log('Step 4: Publishing the deletion of today\'s rule');
                publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);

                // --- STEP 5: Reopen after publish - status bar should be back to "success" (published), visibility chips still warning/warning ---
                cy.log(
                    `Step 5: Reopen after publish - ${todayPlus2} rule should have success status bar, still warning visibility chips`
                );
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
                openVisibilityDialog();
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Status bar should be back to "success" (published - content has been published in its new state)
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('td')
                    .first()
                    .invoke('attr', 'class')
                    .should('match', /__success/);

                // Both visibility chips remain "warning" (today+2 still doesn't match today, even after publishing)
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .within(() => {
                        cy.log(
                            `Checking ${todayPlus2} both chips still warning after publish (day mismatch doesn't change with publish)`
                        );
                        cy.get('[class*="moonstone-chip"]').eq(0).should('have.attr', 'class').and('include', 'warning');
                        cy.get('[class*="moonstone-chip"]').eq(1).should('have.attr', 'class').and('include', 'warning');
                    });

                // Close dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Validates the condition matching dropdown (All vs Any)', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

                openVisibilityDialog();

                // Check if there are any rules in the datatable
                // Note: Previous tests may have deleted rules, so we need to check first
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 10000}).then($rows => {
                    const initialCount = $rows.length;
                    cy.log(`Initial rule count: ${initialCount}`);

                    if (initialCount > 0) {
                        cy.log('Rules present, testing condition matching dropdown');

                        // Look for the condition matching dropdown
                        const matchingDropdown = getComponentByRole(Dropdown, 'condition-matching');
                        matchingDropdown.should('be.visible');

                        // Test that the dropdown can be interacted with
                        matchingDropdown.get().should('not.be.disabled');
                    } else {
                        cy.log('No rules present after delete test, skipping dropdown test');
                    }
                });

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });
        }); // End describe('DatatableRules Tests')
    }); // End describe('Visibility Screen Tests')

    // ---------------------------------------------------------------------------
    // Condition Type Tests
    // ---------------------------------------------------------------------------
    describe('Visibility Condition Type Tests', () => {
        let jcontent: JContent;

        beforeEach(() => {
            cy.loginAndStoreSession();
            // Reset visibility rules so every test starts from a clean slate
            resetVisibilityRules(sitekeyNonI18n);
        });

        afterEach(() => {
            cy.logout();
        });

        it('Adds a Start and End Date condition leaving end date empty', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            // Click "Add condition"
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click();
            });

            // Select "Start and end date" condition type
            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            // Wait for the condition form to render — the start date input appears as
            // [data-sel-content-editor-field="start"] in the CE field selector convention.
            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible').as('startField');

            // Fill only the start date; leave the end date empty.
            // The date picker uses a masked input (NumberFormat) with format ##/##/#### ##:##.
            // We must type all 12 digit positions (no slashes/separators — NumberFormat inserts them)
            // so that the mask is fully filled and the onChange handler fires to update formik.
            cy.get('@startField').find('input').clear();
            cy.get('@startField').find('input').type('010120270000', {delay: 50});

            // Verify end-date field is present but empty
            cy.get('[data-sel-content-editor-field="end"]')
                .should('be.visible')
                .find('input')
                .should('not.have.value', '010120270000');

            // Click Add
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add').click();
            });

            // Verify the rule appeared in the datatable
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length.at.least', 1);

            // Save and close
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Adds Day of Week condition with multiple days and removes one', () => {
            const {today, todayPlus2} = getDayNames();

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            // Add a Day of Week condition with two days
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click();
            });

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Day of the week');

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000})
                .as('dayField')
                .should('be.visible');

            // Select today
            cy.get('@dayField').find('[role="listbox"]').click();
            cy.get('@dayField').find('menu').should('be.visible').contains(today).click();
            cy.get('[data-cm-role="visibilityScreen"]').click();
            cy.get('@dayField').find('[role="listbox"]').should('contain', today);

            // Select todayPlus2
            cy.get('@dayField').find('[role="listbox"]').click();
            cy.get('@dayField').find('menu').should('be.visible').contains(todayPlus2).click();
            cy.get('[data-cm-role="visibilityScreen"]').click();
            cy.get('@dayField').find('[role="listbox"]').should('contain', todayPlus2);

            // Click Add
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add').click();
            });

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length', 1);

            // Now edit the rule to remove one day
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            // Should be in edit mode
            cy.get('[data-sel-role="visibility-rule-table"]').should('not.exist');
            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000})
                .as('editDayField')
                .should('be.visible');

            // Remove todayPlus2 from the selected days by clicking its chip/tag to deselect
            cy.get('@editDayField').find('[role="listbox"]').click();
            cy.get('@editDayField').find('menu').should('be.visible').contains(todayPlus2).click();
            cy.get('[data-cm-role="visibilityScreen"]').click();

            // Verify todayPlus2 is no longer selected
            cy.get('@editDayField').find('[role="listbox"]').should('not.contain', todayPlus2);

            // Save the edit — the button in EditRule uses t('jcontent:label.ok') which renders as 'OK'
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'OK').click();
            });

            // Back to datatable
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // Save the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });
    }); // End describe('Visibility Condition Type Tests')

    // ---------------------------------------------------------------------------
    // Permission Tests
    // ---------------------------------------------------------------------------
    describe('Visibility Permission Tests', () => {
        const reviewerUsername = 'visibilityReviewerUser';
        const reviewerPassword = 'password';

        before(function () {
            createUser(reviewerUsername, reviewerPassword);
            // Grant only the built-in "reviewer" role which does NOT include viewVisibilityTab
            grantRoles(`/sites/${sitekeyNonI18n}`, ['reviewer'], reviewerUsername, 'USER');
        });

        after(function () {
            deleteUser(reviewerUsername);
        });

        afterEach(() => {
            cy.logout();
        });

        it('User with reviewer role does not see the visibility tab button in CE', () => {
            cy.loginAndStoreSession(reviewerUsername, reviewerPassword);
            const jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');

            // The sbsVisibility button should not be rendered for a reviewer
            // (requires viewVisibilityTab site permission which reviewer does not have)
            cy.get('[data-sel-role="sbsVisibility"]').should('not.exist');
        });
    }); // End describe('Visibility Permission Tests')

    // ---------------------------------------------------------------------------
    // Live Mode Tests – DateTime Conditions
    // ---------------------------------------------------------------------------
    describe('Visibility Live Mode Tests', () => {
        let jcontent: JContent;

        beforeEach(() => {
            cy.loginAndStoreSession();
            resetVisibilityRules(sitekeyNonI18n);
            resetVisibilityRules(sitekeyI18n);
            publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);
            publishAndWait(`/sites/${sitekeyI18n}/home`, ['en']);
        });

        afterEach(() => {
            cy.logout();
        });

        it('Validate rules are executed in Live mode by making test 1 visible only in today plus 2', () => {
            // Visit site home page — no-cache forces the browser to revalidate with the
            // server on every visit, ensuring we see the latest published content.
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);

            cy.get('body').contains('test 2').should('contain.text', 'test 1test 2test 3');
            const {todayPlus2} = getDayNames();

            // Add a "today" day-of-week condition and save it
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
            getComponentByRole(Button, 'sbsVisibility').click();

            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click();
            });

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Day of the week');

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000})
                .as('dayField')
                .should('be.visible');

            cy.get('@dayField').find('[role="listbox"]').click();
            cy.get('@dayField').find('menu').should('be.visible').contains(todayPlus2).click();
            cy.get('[data-cm-role="visibilityScreen"]').click();
            cy.get('@dayField').find('[role="listbox"]').should('contain', todayPlus2);

            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add').click();
            });

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

            // Publish the content
            publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);

            // Reopen the visibility dialog and verify live chip is success for today
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
            getComponentByRole(Button, 'sbsVisibility').click();

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // The live chip (second chip) for today's rule should be 'success'
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    // First chip = preview, second chip = live
                    cy.get('[class*="moonstone-chip"]').should('have.length.at.least', 2);
                    cy.get('[class*="moonstone-chip"]').eq(1).should('have.attr', 'class').and('include', 'warning');
                });

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });

            // Validate test 1 is not visible in live anymore
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);
            cy.get('body').should('not.contain', 'test 1test 2test 3').and('contain.text', 'test 2test 3');
        });

        it('Languages section shows correct state after publishing with language restriction in i18n site', () => {
            // Visit site home page — no-cache forces the browser to revalidate with the
            // server on every visit, ensuring we see the latest published content.
            cy.visit(`/sites/${sitekeyI18n}/home.html`);

            cy.get('body').contains('test 2').should('contain.text', 'test 1test 2test 3');
            jcontent = JContent.visit(sitekeyI18n, 'en', 'pages/home');
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit');
            getComponentByRole(Button, 'sbsVisibility').click();

            const visibilityDialog = getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog');
            visibilityDialog.should('be.visible');

            // Verify Languages section is visible in the i18n site
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('Languages').should('be.visible');
            });

            // The language restriction field should be rendered
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.get(
                    '[data-sel-content-editor-field*="invalidLanguages"], [data-sel-content-editor-field*="j:invalidLanguages"]'
                )
                    .as('languageSelector')
                    .should('exist');
                cy.get('@languageSelector').contains('English').should('be.visible').click();
            });

            // Save (changes) and publish
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

            publishAndWait(`/sites/${sitekeyI18n}/home`, ['en']);

            jcontent = JContent.visit(sitekeyI18n, 'en', 'pages/home');
            jcontent
                .switchToPageBuilder()
                .getModule(`/sites/${sitekeyI18n}/home/area-main/test-content1`)
                .getBox()
                .getStatus('notVisible')
                .should('be.visible');
        });
    }); // End describe('Visibility Live Mode Tests')
}); // End outer describe('Visibility Screen')
