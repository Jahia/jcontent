import {JContent} from '../../../page-object';
import {
    addNode,
    BaseComponent,
    Button,
    createSite,
    createUser,
    deleteNode,
    deleteSite,
    deleteUser,
    Dropdown,
    getComponentByRole,
    grantRoles
} from '@jahia/cypress';
import {DateField, ListBoxField} from '../../../page-object/fields';
import {daysFrom} from '../../../utils/timeUtils';

// A visibility condition's date fields render through the same generic field selector as any
// other Content Editor date field, so DateField.getByFieldName applies here directly -- there's
// just no ContentEditor instance to hang ContentEditor.getDateField off, since this dialog has
// its own Save/Cancel (scoped to [data-cm-role="visibilityScreen"]), not the regular
// ContentEditor's.
const getDateField = DateField.getByFieldName;
const getDayOfWeekField = () => ListBoxField.getByFieldName('dayOfWeek');

// The rule-editing panel (Add a condition / Save / Cancel / Close) has its own button bar,
// scoped to [data-cm-role="visibilityScreen"] -- distinct from the outer dialog's own Close
// button, scoped to [data-sel-role="edit-visibility-rules-dialog"].
const getVisibilityButton = (label: string) => cy.get('[data-cm-role="visibilityScreen"]').contains('button', label);

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
        deleteSite(sitekeyNonI18n);
        deleteSite(sitekeyI18n);
        cy.logout();
    });

    describe('Visibility Screen Tests', () => {
        let jcontent: JContent;

        beforeEach(() => {
            cy.loginAndStoreSession();
        });

        it('Display visibility screen in non i18n site with only Date Time section and no rules', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

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
            getVisibilityButton('Add a condition').should('be.visible');

            // The dialog itself only keeps the Close button (no dialog-level Save anymore)
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').should('not.exist');
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
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            // Open the visibility dialog
            openVisibilityDialog();

            // Click Add condition button
            getVisibilityButton('Add a condition').click();

            // Verify the Add New Rule form is displayed
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('No condition').should('not.exist');
            });

            // Verify the condition type dropdown is visible
            getComponentByRole(Dropdown, 'condition-type').should('be.visible');

            // Verify Cancel and Add buttons are visible
            getVisibilityButton('Close').should('be.visible');
            getVisibilityButton('Save').should('be.visible');
        });

        it('Cancels adding a new rule when clicking Close button', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            // Open the visibility dialog
            openVisibilityDialog();

            // Click Add condition button
            getVisibilityButton('Add a condition').click();

            // Verify we're in the add new rule form by checking for dropdown
            getComponentByRole(Dropdown, 'condition-type').should('be.visible');

            // Click Close button
            getVisibilityButton('Close').click();

            // Verify we're back to the no rules state
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('No condition').should('be.visible');
            });
        });

        it('Displays condition type dropdown with available rule types', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            // Open the visibility dialog
            openVisibilityDialog();

            // Click Add condition button
            getVisibilityButton('Add a condition').click();

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
            jcontent.switchToListMode().editComponentByRowName('test-content1');

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
            jcontent.switchToListMode().editComponentByRowName('test-content1');

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

        it('Dialog actions only expose the Close button (no dialog-level Save)', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            // Open the visibility dialog
            openVisibilityDialog();

            // The dialog footer keeps only the Close button now that each section saves itself
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').should('not.exist');
                cy.contains('button', 'Close').should('be.visible').and('not.be.disabled');
            });

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
        });

        it('Verifies Close button closes the dialog without saving', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

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
                jcontent.switchToListMode().editComponentByRowName('test-content1');

                // Open the visibility dialog
                openVisibilityDialog();

                // Add first rule - Today
                cy.log(`Adding ${today} rule`);
                getVisibilityButton('Add a condition').click();

                // Select "Day of the week" from dropdown
                const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
                conditionTypeDropdown.select('Day of the week');

                // Wait for the form to load by checking for the field
                cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');

                // Select today from the list
                getDayOfWeekField().toggleValue(today).shouldContainValue(today);

                // Click Add button to add the rule
                getVisibilityButton('Save').click();

                // Wait for datatable to appear
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Verify the datatable now shows at least 1 rule
                cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                    // Should not show "No condition" anymore
                    cy.contains('No condition').should('not.exist');
                });

                // Add second rule - Today + 2
                cy.log(`Adding ${todayPlus2} rule`);
                getVisibilityButton('Add a condition').click();

                // Select "Day of the week" from dropdown again
                const conditionTypeDropdown2 = getComponentByRole(Dropdown, 'condition-type');
                conditionTypeDropdown2.select('Day of the week');

                // Wait for the form to load by checking for the field
                cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');

                // Select today+2 from the list
                getDayOfWeekField().toggleValue(todayPlus2).shouldContainValue(todayPlus2);

                // Click Add button
                getVisibilityButton('Save').click();

                // Verify the datatable is visible and contains rows
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).as('table').should('be.visible');
                cy.get('@table').find('tbody tr').should('have.length.at.least', 2);

                // Save the dialog
                cy.log('Saving the rules');
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });

                // Dialog should close after save
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
            });

            it('Reopens dialog and validates the saved rules in datatable', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().editComponentByRowName('test-content1');

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

            // To be fixed https://github.com/Jahia/jcontent/issues/2382
            it.skip('Publishes the rules and validates different visibility status for today vs today+2', () => {
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
                jcontent.switchToListMode().editComponentByRowName('test-content1');
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
                        cy.get('[class*="moonstone-chip"]').should('have.length', 1).and('contain.text', 'Visible');
                    });

                cy.log(`Checking visibility status for ${todayPlus2} rule (should be hidden today)`);
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .eq(1)
                    .within(() => {
                        // Should have visibility chips showing status in preview and live
                        cy.get('[class*="moonstone-chip"]').should('have.length', 1);
                    });

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Edits a rule and validates modified status in datatable', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().editComponentByRowName('test-content1');

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

                // Verify we're in edit mode - the edition panel is shown on top and the datatable now
                // keeps only the edited row visible (the other rows are hidden).
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 10000}).should('have.length', 1);
                cy.get('input[type="checkbox"]', {timeout: 10000}).filter(':visible').should('exist');

                // Cancel the edit
                getVisibilityButton('Cancel').click();

                // Should be back to the datatable
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Marks a rule for deletion (without removing it) and can undelete it', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().editComponentByRowName('test-content1');

                // Open the visibility dialog
                openVisibilityDialog();

                // Get initial count of rules and save as alias to avoid deep nesting
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 10000}).then($rows => {
                    cy.log(`Initial rule count: ${$rows.length}`);
                    cy.wrap($rows.length).as('initialCount');
                });

                // Mark the first rule for deletion
                cy.log('Marking the first rule for deletion');
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('[data-sel-role="delete-condition"]')
                    .click({force: true});

                // The rule must NOT be removed: it stays in the table, marked for deletion
                cy.get('@initialCount').then((initialCount: number) => {
                    cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 5000}).should(
                        'have.length',
                        initialCount
                    );
                });

                // A row marked for deletion shows the danger status bar and an Undelete action
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('[data-sel-role="condition-status"] [class*="markedForDeletion"]')
                    .should('exist');
                cy.get('[data-sel-role="visibility-rule-table"]')
                    .find('[data-sel-role="undelete-condition"]')
                    .should('be.visible');

                // Undelete it: the row goes back to its regular state (delete action available again)
                cy.log('Undeleting the rule');
                cy.get('[data-sel-role="visibility-rule-table"]')
                    .find('[data-sel-role="undelete-condition"]')
                    .first()
                    .click({force: true});

                cy.get('[data-sel-role="visibility-rule-table"]')
                    .find('[data-sel-role="undelete-condition"]')
                    .should('not.exist');
                cy.get('[data-sel-role="visibility-rule-table"]')
                    .find('[data-sel-role="delete-condition"]')
                    .should('have.length.at.least', 1);

                // Row count is unchanged throughout the mark/undelete cycle
                cy.get('@initialCount').then((initialCount: number) => {
                    cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length', initialCount);
                });

                // Close the dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });

                // Dialog should close
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
            });

            it('Persists the marked-for-deletion state across a dialog reopen', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().editComponentByRowName('test-content1');
                openVisibilityDialog();
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // Capture the initial number of rules
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr').then($rows => {
                    cy.log(`Initial rule count: ${$rows.length}`);
                    cy.wrap($rows.length).as('initialCount');
                });

                // --- STEP 1: Mark the first rule for deletion ---
                cy.log('Step 1: Marking the first rule for deletion');
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('[data-sel-role="delete-condition"]')
                    .click({force: true});

                // The row stays, with a danger status bar and an Undelete action; count unchanged
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .find('[data-sel-role="condition-status"] [class*="markedForDeletion"]')
                    .should('exist');
                cy.get('[data-sel-role="undelete-condition"]').should('be.visible');
                cy.get('@initialCount').then((initialCount: number) => {
                    cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length', initialCount);
                });

                // --- STEP 2: Close and reopen the dialog ---
                cy.log('Step 2: Closing and reopening the dialog');
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().editComponentByRowName('test-content1');
                openVisibilityDialog();
                cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

                // --- STEP 3: The marked-for-deletion state is persisted ---
                cy.log('Step 3: Reopened dialog still shows the rule as marked for deletion');
                cy.get('@initialCount').then((initialCount: number) => {
                    cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length', initialCount);
                });
                cy.get('[data-sel-role="undelete-condition"]').should('be.visible');
                cy.get('[data-sel-role="visibility-rule-table"]')
                    .find('[data-sel-role="condition-status"] [class*="markedForDeletion"]')
                    .should('exist');

                // --- STEP 4: Undelete to restore a clean state for subsequent tests ---
                cy.log('Step 4: Undeleting the rule to restore it');
                cy.get('[data-sel-role="visibility-rule-table"]')
                    .find('[data-sel-role="undelete-condition"]')
                    .first()
                    .click({force: true});
                cy.get('[data-sel-role="undelete-condition"]').should('not.exist');

                // Close dialog
                cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                    cy.contains('button', 'Close').click();
                });
            });

            it('Validates the condition matching dropdown (All vs Any)', () => {
                jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
                jcontent.switchToListMode().editComponentByRowName('test-content1');

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
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            // Click "Add condition"
            getVisibilityButton('Add a condition').click();

            // Select "Start and end date" condition type
            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            // Wait for the condition form to render — the start date input appears as
            // [data-sel-content-editor-field="start"] in the CE field selector convention.
            const startField = getDateField('start');
            startField.get().should('be.visible');

            // Fill only the start date; leave the end date empty.
            startField.addNewValue('01/01/2027 00:00');

            // Verify end-date field is present but empty
            const endField = getDateField('end');
            endField.get().should('be.visible');
            endField.checkEmpty();

            // Click Add
            getVisibilityButton('Save').click();

            // Verify the rule appeared in the datatable
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length.at.least', 1);

            // Save and close
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Round-trips a Start and End Date condition\'s date/time exactly when reopened for edit', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');

            // The picker converts local -> UTC on save and UTC -> local on read; typing distinct,
            // unambiguous values (different month, day, hour and minute) and asserting the exact
            // same values come back is what would catch a conversion bug in either direction,
            // regardless of which timezone the browser under test happens to run in.
            const startValue = '01/15/2027 09:15';
            const endValue = '02/20/2027 17:45';

            const startField = getDateField('start');
            const endField = getDateField('end');
            startField.addNewValue(startValue);
            endField.addNewValue(endValue);

            // The "shown in your local time zone" hint must be visible next to the fields —
            // the display convention is meaningless if the editor can't see whose time it is.
            startField.get().find('[data-sel-role="date-field-timezone-hint"]').should('be.visible');

            getVisibilityButton('Save').click();

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // The row label is formatted from the stored UTC instant, converted back to the
            // browser's local time — a write/read conversion mismatch would render a shifted
            // date and/or time here.
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .should('contain.text', 'January 15, 2027 9:15 AM')
                .and('contain.text', 'February 20, 2027 5:45 PM');

            // Reopen the condition for edit.
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            // The re-edit form must show back exactly what was typed — no compounding drift from
            // repeated local -> UTC -> local conversions.
            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');
            getDateField('start').checkValue(startValue);
            getDateField('end').checkValue(endValue);

            // Leave without resaving — this test only verifies the round trip, not a further edit.
            getVisibilityButton('Cancel').click();

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Clearing an existing end date on a Start and End Date condition actually removes it, not just hides it', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');

            // Save with both a start and an end date set.
            getDateField('start').addNewValue('01/15/2027 09:15');
            getDateField('end').addNewValue('02/20/2027 17:45');

            getVisibilityButton('Save').click();

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .should('contain.text', 'January 15, 2027 9:15 AM')
                .and('contain.text', 'February 20, 2027 5:45 PM');

            // Reopen the condition and clear only the end date.
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            cy.get('[data-sel-content-editor-field="end"]', {timeout: 10000}).should('be.visible');
            getDateField('end').clearValue();

            getVisibilityButton('Save').click();

            // The label must drop the end date entirely (the "until ..." clause), not just fail
            // to update it — a stale end date left in place would still show a "until" clause.
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .should('contain.text', 'January 15, 2027 9:15 AM')
                .and('not.contain.text', 'February 20, 2027')
                .and('not.contain.text', 'until');

            // Reload from scratch (no client-side cache) and reopen for edit: the end field must
            // come back empty. Before the fix, the mutation only ever set the properties it was
            // given and never removed one that was simply absent — so the end date would silently
            // survive on the node and reappear here even though the label above already looked fixed.
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');
            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');
            getDateField('start').checkValue('01/15/2027 09:15');
            getDateField('end').checkEmpty();

            getVisibilityButton('Cancel').click();
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Disables Save for a new Start and End Date condition while both dates are blank', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');

            // Neither date is set yet — a condition with no start and no end is a no-op, so
            // Save must be disabled rather than let the editor create a rule that does nothing.
            getVisibilityButton('Save').should('be.disabled');

            // Filling in just one of the two (still a legitimate, open-ended condition) re-enables it.
            getDateField('start').addNewValue('01/01/2027 00:00');
            getVisibilityButton('Save').should('not.be.disabled');

            // Clearing it back to blank disables Save again.
            getDateField('start').clearValue();
            getVisibilityButton('Save').should('be.disabled');

            // Setting the end date instead is equally sufficient to re-enable Save.
            getDateField('end').addNewValue('02/01/2027 12:00');
            getVisibilityButton('Save').should('not.be.disabled');

            // Leave without saving — this test only verifies the disabled state, not a save.
            getVisibilityButton('Close').click();
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Disables Save when editing a Start and End Date condition down to both dates blank', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');
            getDateField('start').addNewValue('01/15/2027 09:15');
            getDateField('end').addNewValue('02/20/2027 17:45');

            getVisibilityButton('Save').click();
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // Reopen the saved condition and clear both dates.
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');
            getDateField('start').clearValue();
            getDateField('end').clearValue();

            getVisibilityButton('Save').should('be.disabled');

            // Leave without saving — the previously-saved condition must be left untouched.
            getVisibilityButton('Cancel').click();
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .should('contain.text', 'January 15, 2027 9:15 AM')
                .and('contain.text', 'February 20, 2027 5:45 PM');

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Disables Save for a new Day of Week condition while no day is selected', () => {
            const {today} = getDayNames();

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Day of the week');

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');
            const dayField = getDayOfWeekField();

            // No day selected yet — a condition that matches no day of the week is a no-op, so
            // Save must be disabled rather than let the editor create a rule that does nothing.
            getVisibilityButton('Save').should('be.disabled');

            // Selecting a single day re-enables Save.
            dayField.toggleValue(today, 'top').shouldContainValue(today);
            getVisibilityButton('Save').should('not.be.disabled');

            // Deselecting it back down to zero disables Save again.
            dayField.toggleValue(today, 'top').shouldNotContainValue(today);
            getVisibilityButton('Save').should('be.disabled');

            // Leave without saving — this test only verifies the disabled state, not a save.
            getVisibilityButton('Close').click();
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Disables Save when editing a Day of Week condition down to no days selected', () => {
            const {today} = getDayNames();

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Day of the week');

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');
            getDayOfWeekField().toggleValue(today, 'top').shouldContainValue(today);

            getVisibilityButton('Save').click();
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // Reopen the saved condition and deselect its only day.
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');
            getDayOfWeekField().toggleValue(today, 'top').shouldNotContainValue(today);

            getVisibilityButton('Save').should('be.disabled');

            // Leave without saving — the previously-saved condition must be left untouched.
            getVisibilityButton('Cancel').click();
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .should('contain.text', today);

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');
        });

        it('Adds Day of Week condition with multiple days and removes one', () => {
            const {today, todayPlus2} = getDayNames();

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');

            getComponentByRole(Button, 'sbsVisibility').click();
            getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog').should('be.visible');

            // Add a Day of Week condition with two days
            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Day of the week');

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');
            const dayField = getDayOfWeekField();

            // Select today
            dayField.toggleValue(today).shouldContainValue(today);

            // Select todayPlus2
            dayField.toggleValue(todayPlus2).shouldContainValue(todayPlus2);

            // Click Add
            getVisibilityButton('Save').click();

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length', 1);

            // Now edit the rule to remove one day
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    cy.get('button:has(svg)').filter(':visible').first().click({force: true});
                });

            // Should be in edit mode - the edition panel is shown and the datatable keeps only the
            // edited row visible.
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr', {timeout: 10000}).should('have.length', 1);
            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');

            // Remove todayPlus2 from the selected days by clicking its chip/tag to deselect. The
            // 'top' close position avoids the open menu, which now sits above the edited row,
            // covering the Save button.
            getDayOfWeekField().toggleValue(todayPlus2, 'top').shouldNotContainValue(todayPlus2);

            // Save the edit — the button in EditRule uses t('jcontent:label.ok') which renders as 'OK'
            getVisibilityButton('Save').click();

            // Back to datatable
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // Save the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
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
            jcontent.switchToListMode().editComponentByRowName('test-content1');

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
            jcontent.switchToListMode().editComponentByRowName('test-content1');
            getComponentByRole(Button, 'sbsVisibility').click();

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Day of the week');

            cy.get('[data-sel-content-editor-field="dayOfWeek"]', {timeout: 10000}).should('be.visible');
            getDayOfWeekField().toggleValue(todayPlus2).shouldContainValue(todayPlus2);

            getVisibilityButton('Save').click();

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

            // Publish the content
            publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);

            // Reopen the visibility dialog and verify live chip is success for today
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');
            getComponentByRole(Button, 'sbsVisibility').click();

            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            // The live chip (second chip) for today's rule should be 'success'
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    // First chip = preview, second chip = live
                    cy.get('[class*="moonstone-chip"]').should('have.length', 1);
                    cy.get('[class*="moonstone-chip"]').eq(0).should('have.attr', 'class').and('include', 'warning');
                });

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });

            // Validate test 1 is not visible in live anymore
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);
            cy.get('body').should('not.contain', 'test 1test 2test 3').and('contain.text', 'test 2test 3');
        });

        it('Shows content in live mode when now falls inside a Start and End Date condition\'s window', () => {
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);
            cy.get('body').contains('test 2').should('contain.text', 'test 1test 2test 3');

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');
            getComponentByRole(Button, 'sbsVisibility').click();

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');

            // A window that comfortably spans "now" (±2 days), so the assertion doesn't depend on
            // exactly how long the test itself takes to run. Typed as the browser's own local
            // time — this is what exercises the actual local -> UTC -> evaluate -> UTC -> local
            // round trip end to end, not just the display layer.
            getDateField('start').addNewValue(daysFrom(-2));
            getDateField('end').addNewValue(daysFrom(2));

            getVisibilityButton('Save').click();
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

            publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);

            // "Now" falls inside [start, end]: the condition matches, content stays visible.
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);
            cy.get('body').should('contain.text', 'test 1test 2test 3');
        });

        it('Hides content in live mode when now falls outside a Start and End Date condition\'s window', () => {
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);
            cy.get('body').contains('test 2').should('contain.text', 'test 1test 2test 3');

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');
            getComponentByRole(Button, 'sbsVisibility').click();

            getVisibilityButton('Add a condition').click();

            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type');
            conditionTypeDropdown.select('Start and end date');

            cy.get('[data-sel-content-editor-field="start"]', {timeout: 10000}).should('be.visible');

            // A window that ended in the past (both start and end before "now" by a comfortable margin).
            getDateField('start').addNewValue(daysFrom(-4));
            getDateField('end').addNewValue(daysFrom(-2));

            getVisibilityButton('Save').click();
            cy.get('[data-sel-role="visibility-rule-table"]', {timeout: 10000}).should('be.visible');

            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
            });
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist');

            publishAndWait(`/sites/${sitekeyNonI18n}/home`, ['en']);

            // "Now" falls outside [start, end]: the condition no longer matches, content is hidden.
            cy.visit(`/sites/${sitekeyNonI18n}/home.html`);
            cy.get('body').should('not.contain', 'test 1test 2test 3').and('contain.text', 'test 2test 3');
        });

        it('Languages section shows correct state after publishing with language restriction in i18n site', () => {
            // Visit site home page — no-cache forces the browser to revalidate with the
            // server on every visit, ensuring we see the latest published content.
            cy.visit(`/sites/${sitekeyI18n}/home.html`);

            cy.get('body').contains('test 2').should('contain.text', 'test 1test 2test 3');
            jcontent = JContent.visit(sitekeyI18n, 'en', 'pages/home');
            jcontent.switchToListMode().editComponentByRowName('test-content1');
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
                // Languages Save button is disabled until a change is made
                cy.get('[data-sel-role="languages-save-button"]').should('be.disabled');
                cy.get('@languageSelector').contains('English').should('be.visible').click();
            });

            // The Languages section saves itself via its own Save button (enabled once dirty)
            cy.get('[data-sel-role="languages-save-button"]').should('not.be.disabled').click();

            // After saving, the Save button becomes disabled again (no pending change)
            cy.get('[data-sel-role="languages-save-button"]', {timeout: 10000}).should('be.disabled');

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click();
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

    // ---------------------------------------------------------------------------
    // Visibility conditions on copied / referenced content, validated in Live mode
    // ---------------------------------------------------------------------------
    describe('Visibility Conditions on Copied Content', () => {
        const richTextHidden = 'visibility-copy-hidden';
        const richTextHiddenText = 'Hidden Visibility Content';
        const richTextVisible = 'visibility-copy-visible';
        const richTextVisibleText = 'Visible Visibility Content';
        const testPageName = 'testPageVisibility';
        const refPageName = 'testPageVisibilityRef';
        const areaMainPath = `/sites/${sitekeyNonI18n}/home/${testPageName}/area-main`;
        const refAreaMainPath = `/sites/${sitekeyNonI18n}/home/${refPageName}/area-main`;

        before(() => {
            const {today: todayDay, todayPlus2: notTodayDay} = getDayNames();

            addNode({
                parentPathOrId: `/sites/${sitekeyNonI18n}/contents`,
                name: richTextHidden,
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', value: richTextHiddenText, language: 'en'}]
            });
            cy.apollo({
                mutationFile: 'contentEditor/visibility/createRules.graphql',
                variables: {
                    contentPath: `/sites/${sitekeyNonI18n}/contents/${richTextHidden}`,
                    dayOfWeek: [notTodayDay.toLowerCase()]
                }
            });

            addNode({
                parentPathOrId: `/sites/${sitekeyNonI18n}/contents`,
                name: richTextVisible,
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', value: richTextVisibleText, language: 'en'}]
            });
            cy.apollo({
                mutationFile: 'contentEditor/visibility/createRules.graphql',
                variables: {
                    contentPath: `/sites/${sitekeyNonI18n}/contents/${richTextVisible}`,
                    dayOfWeek: [todayDay.toLowerCase()]
                }
            });

            addNode({
                parentPathOrId: `/sites/${sitekeyNonI18n}/home`,
                name: testPageName,
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'testPageVisibility', language: 'en'},
                    {name: 'j:templateName', type: 'STRING', value: 'simple'}
                ],
                children: [{name: 'area-main', primaryNodeType: 'jnt:contentList'}]
            });

            // Dedicated page for the reference scenarios, isolated from the copy/paste page above.
            addNode({
                parentPathOrId: `/sites/${sitekeyNonI18n}/home`,
                name: refPageName,
                primaryNodeType: 'jnt:page',
                properties: [
                    {name: 'jcr:title', value: 'testPageVisibilityRef', language: 'en'},
                    {name: 'j:templateName', type: 'STRING', value: 'simple'}
                ],
                children: [{name: 'area-main', primaryNodeType: 'jnt:contentList'}]
            });

            publishAndWait(`/sites/${sitekeyNonI18n}`);
        });

        after(() => {
            deleteNode(`/sites/${sitekeyNonI18n}/home/${testPageName}`);
            deleteNode(`/sites/${sitekeyNonI18n}/home/${refPageName}`);
            deleteNode(`/sites/${sitekeyNonI18n}/contents/${richTextHidden}`);
            deleteNode(`/sites/${sitekeyNonI18n}/contents/${richTextVisible}`);
            cy.logout();
        });

        beforeEach(() => {
            cy.loginAndStoreSession();
        });

        it('copy richtext with not-visible condition and check in live', () => {
            // Copy the non-visible richtext
            const jcontent = JContent.visit(sitekeyNonI18n, 'en', 'content-folders/contents');
            jcontent.switchToListMode()
                .getTable()
                .getRowByName(richTextHidden)
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').should('contain', 'clipboard');

            // Navigate to testPageVisibility via the accordion to keep the clipboard
            jcontent.getAccordionItem('pages').click();
            jcontent.getAccordionItem('pages').getTreeItem('home').expand();
            jcontent.getAccordionItem('pages').getTreeItem(testPageName).click();
            const jcontentPB = jcontent.switchToPageBuilder();
            const pasteBtn = jcontentPB
                .getModule(areaMainPath)
                .getCreateButtons()
                .getButton('Paste');
            pasteBtn.should('be.visible');
            pasteBtn.click();
            cy.get('#message-id').should('contain', 'pasted');

            publishAndWait(`/sites/${sitekeyNonI18n}/home/${testPageName}`);

            // Verify the richtext is NOT visible in live
            cy.visit(`/sites/${sitekeyNonI18n}/home/${testPageName}.html`);
            cy.get('body').should('not.contain', richTextHiddenText);
        });

        it('copy richtext with visible condition and check in live', () => {
            // Copy the visible richtext
            const jcontent = JContent.visit(sitekeyNonI18n, 'en', 'content-folders/contents');
            jcontent.switchToListMode()
                .getTable()
                .getRowByName(richTextVisible)
                .contextMenu()
                .selectByRole('copy');
            cy.get('#message-id').should('contain', 'clipboard');

            // Navigate to testPageVisibility via the accordion to keep the clipboard
            jcontent.getAccordionItem('pages').click();
            jcontent.getAccordionItem('pages').getTreeItem('home').expand();
            jcontent.getAccordionItem('pages').getTreeItem(testPageName).click();
            const jcontentPB = jcontent.switchToPageBuilder();
            const pasteBtn = jcontentPB
                .getModule(areaMainPath)
                .getCreateButtons()
                .getButton('Paste');
            pasteBtn.should('be.visible');
            pasteBtn.click();
            cy.get('#message-id').should('contain', 'pasted');

            publishAndWait(`/sites/${sitekeyNonI18n}/home/${testPageName}`);

            // Verify the richtext is visible in live
            cy.visit(`/sites/${sitekeyNonI18n}/home/${testPageName}.html`);
            cy.get('body').should('contain', richTextVisibleText);
        });

        it('referenced content with visible condition is shown in live', () => {
            addNode({
                parentPathOrId: refAreaMainPath,
                name: 'ref-visible',
                primaryNodeType: 'jnt:contentReference',
                properties: [
                    {name: 'j:node', type: 'REFERENCE', value: `/sites/${sitekeyNonI18n}/contents/${richTextVisible}`}
                ]
            });

            publishAndWait(`/sites/${sitekeyNonI18n}/home/${refPageName}`);

            // Verify the referenced content is visible in live
            cy.visit(`/sites/${sitekeyNonI18n}/home/${refPageName}.html`);
            cy.get('body').should('contain', richTextVisibleText);
        });

        it('referenced content with not-visible condition is hidden in live', () => {
            addNode({
                parentPathOrId: refAreaMainPath,
                name: 'ref-hidden',
                primaryNodeType: 'jnt:contentReference',
                properties: [
                    {name: 'j:node', type: 'REFERENCE', value: `/sites/${sitekeyNonI18n}/contents/${richTextHidden}`}
                ]
            });

            publishAndWait(`/sites/${sitekeyNonI18n}/home/${refPageName}`);

            // Verify the referenced content is NOT visible in live
            cy.visit(`/sites/${sitekeyNonI18n}/home/${refPageName}.html`);
            cy.get('body').should('not.contain', richTextHiddenText);
        });
    }); // End describe('Visibility Conditions on Copied Content')
}); // End outer describe('Visibility Screen')
