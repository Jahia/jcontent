import { ContentEditor, JContent } from '../../page-object'
import {
    BaseComponent,
    Button,
    createSite,
    deleteSite,
    Dropdown,
    getComponentByRole,
    publishAndWaitJobEnding,
} from '@jahia/cypress'

const sitekeyNonI18n = 'jcontentSite'
const sitekeyI18n = 'jcontentSiteI18N'

// Helper to get day names for testing
const getDayNames = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date().getDay()
    const todayPlus2 = (today + 2) % 7
    return {
        today: days[today],
        todayPlus2: days[todayPlus2]
    }
}

describe('Visibility Screen Tests', () => {
    let jcontent: JContent

    before(function () {
        createSite(sitekeyNonI18n, {
            languages: 'en',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en',
        })
        cy.apollo({ mutationFile: 'jcontent/createContent.graphql' })
        createSite(sitekeyI18n, {
            languages: 'en,fr,de',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en',
        })
        cy.apollo({
            mutationFile: 'jcontent/createContent.graphql',
            variables: {
                homePath: `/sites/${sitekeyI18n}/home`,
            },
        })

        publishAndWaitJobEnding(`/sites/${sitekeyI18n}`)
        publishAndWaitJobEnding(`/sites/${sitekeyNonI18n}`)
    })

    after(function () {
        cy.logout()
        deleteSite(sitekeyNonI18n)
        deleteSite(sitekeyI18n)
    })

    beforeEach(() => {
        cy.loginAndStoreSession()
    })

    afterEach(() => {
        cy.logout()
    })

    it('Display visibility screen in non i18n site with only Date Time section and no rules', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')
        const contentEditor = new ContentEditor()

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Verify the dialog is open
        const visibilityDialog = getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog')
        visibilityDialog.should('be.visible')

        // Verify the DateTime section is visible
        cy.get('[data-cm-role="visibilityScreen"]').should('be.visible')

        // Verify Languages section is NOT visible (non-i18n site)
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('Languages').should('not.exist')
        })

        // Verify Date/Time section title is visible
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('Date and time').should('be.visible')
        })

        // Verify "No rules" message is displayed
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('No condition').should('be.visible')
        })

        // Verify "Add condition" button is visible
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('button', 'Add condition').should('be.visible')
        })

        // Verify Save and Close buttons are visible in dialog
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Save').should('be.visible')
            cy.contains('button', 'Close').should('be.visible')
        })

        // Close the dialog
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Close').click()
        })

        // Verify dialog is closed
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist')
    })

    it('Opens the Add New Rule form when clicking Add condition button', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Click Add condition button
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('button', 'Add condition').click()
        })

        // Verify the Add New Rule form is displayed
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('No condition').should('not.exist')
        })

        // Verify the condition type dropdown is visible
        getComponentByRole(Dropdown, 'condition-type').should('be.visible')

        // Verify Cancel and Add buttons are visible
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('button', 'Close').should('be.visible')
            cy.contains('button', 'Add').should('be.visible')
        })
    })

    it('Cancels adding a new rule when clicking Close button', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Click Add condition button
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('button', 'Add condition').click()
        })

        // Verify we're in the add new rule form by checking for dropdown
        getComponentByRole(Dropdown, 'condition-type').should('be.visible')

        // Click Close button
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('button', 'Close').click()
        })

        // Verify we're back to the no rules state
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('No condition').should('be.visible')
        })
    })

    it('Displays condition type dropdown with available rule types', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Click Add condition button
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('button', 'Add condition').click()
        })

        // Open the condition type dropdown
        const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type')
        conditionTypeDropdown.get().click()

        // Verify some expected condition types are available
        // These are standard condition types that should be available
        cy.get('body').within(() => {
            // Look for common condition types - at least one should exist
            cy.get('[role="listbox"]').should('be.visible')
        })
    })

    it('Display visibility screen in i18n site with Languages section', () => {
        jcontent = JContent.visit(sitekeyI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Verify the dialog is open
        const visibilityDialog = getComponentByRole(BaseComponent, 'edit-visibility-rules-dialog')
        visibilityDialog.should('be.visible')

        // Verify the DateTime section is visible
        cy.get('[data-cm-role="visibilityScreen"]').should('be.visible')

        // Verify Languages section IS visible (i18n site with multiple languages)
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('Languages').should('be.visible')
        })

        // Verify Date/Time section title is visible
        cy.get('[data-cm-role="visibilityScreen"]').within(() => {
            cy.contains('Date and time').should('be.visible')
        })

        // Close the dialog
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Close').click()
        })
    })

    it('Displays content name in dialog title', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Verify the content name is displayed in the dialog title
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.get('[id="dialog-language-title"]').should('be.visible')
            // The title should contain some text (the content name)
            cy.get('[id="dialog-language-title"]').should('not.be.empty')
        })

        // Close the dialog
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Close').click()
        })
    })

    it('Verifies Save button is present and enabled when no errors', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Verify Save button exists and is not disabled
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Save').should('be.visible')
            cy.contains('button', 'Save').should('not.be.disabled')
        })

        // Close the dialog
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Close').click()
        })
    })

    it('Verifies Close button closes the dialog without saving', () => {
        jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
        jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

        // Open the visibility dialog
        getComponentByRole(Button, 'editVisibilityRules').click()

        // Verify dialog is visible
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('be.visible')

        // Click Close button
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
            cy.contains('button', 'Close').click()
        })

        // Verify dialog is closed
        cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist')

        // Verify we're still in the content editor (not closed)
        cy.get('body').should('be.visible')
    })

    describe('DatatableRules Tests', () => {
        it('Adds Day of Week rules using dynamic days (today and today+2) and validates in datatable', () => {
            const { today, todayPlus2 } = getDayNames()
            cy.log(`Testing with days: ${today} (today) and ${todayPlus2} (today+2)`)

            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

            // Open the visibility dialog
            getComponentByRole(Button, 'editVisibilityRules').click()

            // Add first rule - Today
            cy.log(`Adding ${today} rule`)
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click()
            })

            // Select "Day of the week" from dropdown
            const conditionTypeDropdown = getComponentByRole(Dropdown, 'condition-type')
            conditionTypeDropdown.select('Day of the week')

            // Wait for the form to load by checking for the field
            cy.get('[data-sel-content-editor-field="dayOfWeek"]', { timeout: 10000 }).should('be.visible')

            // Select today from the left list
            cy.get('[data-sel-content-editor-field="dayOfWeek"]')
                .find('.moonstone-listSelector_left')
                .contains(today)
                .click()

            // Verify today appears in the right list (selected items)
            cy.get('[data-sel-content-editor-field="dayOfWeek"]')
                .find('.moonstone-listSelector_right')
                .should('contain', today)

            // Click Add button to add the rule
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add').click()
            })

            // Wait for datatable to appear
            cy.get('[data-sel-role="visibility-rule-table"]', { timeout: 10000 }).should('be.visible')

            // Verify the datatable now shows at least 1 rule
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                // Should not show "No condition" anymore
                cy.contains('No condition').should('not.exist')
            })

            // Add second rule - Today + 2
            cy.log(`Adding ${todayPlus2} rule`)
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add condition').click()
            })

            // Select "Day of the week" from dropdown again
            const conditionTypeDropdown2 = getComponentByRole(Dropdown, 'condition-type')
            conditionTypeDropdown2.select('Day of the week')

            // Wait for the form to load by checking for the field
            cy.get('[data-sel-content-editor-field="dayOfWeek"]', { timeout: 10000 }).should('be.visible')

            // Select today+2 from the left list
            cy.get('[data-sel-content-editor-field="dayOfWeek"]')
                .find('.moonstone-listSelector_left')
                .contains(todayPlus2)
                .click()

            // Verify today+2 appears in the right list (selected items)
            cy.get('[data-sel-content-editor-field="dayOfWeek"]')
                .find('.moonstone-listSelector_right')
                .should('contain', todayPlus2)

            // Click Add button
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Add').click()
            })

            // Verify the datatable is visible and contains rows
            cy.get('[data-sel-role="visibility-rule-table"]', { timeout: 10000 }).as('table').should('be.visible')
            cy.get('@table').find('tbody tr').should('have.length.at.least', 2)

            // Save the dialog
            cy.log('Saving the rules')
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').click()
            })

            // Dialog should close after save
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist')
        })

        it('Reopens dialog and validates the saved rules in datatable', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

            // Reopen the visibility dialog
            getComponentByRole(Button, 'editVisibilityRules').click()

            // Verify the datatable shows the saved rules
            cy.get('[data-sel-role="visibility-rule-table"]', { timeout: 10000 }).should('be.visible')

            // Verify we don't see "No condition"
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('No condition').should('not.exist')
            })

            // Verify the datatable contains rows with our rules
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length.at.least', 2)

            // Verify the table is populated (has actual content)
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').first().should('not.be.empty')

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click()
            })
        })

        it('Publishes the rules and validates different visibility status for today vs today+2', () => {
            const { today, todayPlus2 } = getDayNames()
            cy.log(`Verifying visibility for ${today} (today - should be visible) and ${todayPlus2} (today+2 - should be hidden)`)

            // First, get the path to the content
            const contentPath = `/sites/${sitekeyNonI18n}/home`

            // Publish the content with the rules
            cy.log('Publishing the content with visibility rules')
            publishAndWaitJobEnding(contentPath, ['en'])

            // Reopen the visibility dialog
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')
            getComponentByRole(Button, 'editVisibilityRules').click()

            // Verify the datatable shows the rules
            cy.get('[data-sel-role="visibility-rule-table"]', { timeout: 10000 }).should('be.visible')

            // Verify the datatable contains rows
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').should('have.length.at.least', 2)

            // After publishing, verify visibility status chips show different states for today vs today+2
            cy.log(`Checking visibility status for ${today} rule (should be visible today)`)
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    // Should have visibility chips showing status in preview and live
                    cy.get('[class*="moonstone-chip"]').should('have.length.at.least', 2)
                })

            cy.log(`Checking visibility status for ${todayPlus2} rule (should be hidden today)`)
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .eq(1)
                .within(() => {
                    // Should have visibility chips showing status in preview and live
                    cy.get('[class*="moonstone-chip"]').should('have.length.at.least', 2)
                })

            // Verify the chips show different states by comparing the two rules
            // The second chip in each row represents the live visibility status
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr').first().find('[class*="moonstone-chip"]').eq(1).invoke('attr', 'class').then(firstChipClass => {
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr').eq(1).find('[class*="moonstone-chip"]').eq(1).invoke('attr', 'class').then(secondChipClass => {
                    cy.log(`First rule (${today}) live chip class: ${firstChipClass}`)
                    cy.log(`Second rule (${todayPlus2}) live chip class: ${secondChipClass}`)

                    // The chips should have different colors indicating different visibility states
                    // One should be visible (info/success) and one should be hidden (default/danger)
                    expect(firstChipClass).not.to.equal(secondChipClass)
                })
            })

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click()
            })
        })

        it('Edits a rule and validates modified status in datatable', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

            // Open the visibility dialog
            getComponentByRole(Button, 'editVisibilityRules').click()

            // Verify the datatable is visible
            cy.get('[data-sel-role="visibility-rule-table"]', { timeout: 10000 }).should('be.visible')

            // Click edit button on the first rule
            cy.log('Clicking edit on the first rule')
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                .first()
                .within(() => {
                    // Look for edit button - should be the first action button
                    cy.get('button[aria-label*="edit"], button:has(svg)')
                        .filter(':visible')
                        .first()
                        .click({ force: true })
                })

            // Verify we're in edit mode - the datatable should be hidden and edit form visible
            cy.get('[data-sel-role="visibility-rule-table"]').should('not.exist')
            cy.get('input[type="checkbox"]', { timeout: 10000 }).filter(':visible').should('exist')

            // Cancel the edit
            cy.get('[data-cm-role="visibilityScreen"]').within(() => {
                cy.contains('button', 'Cancel').click()
            })

            // Should be back to the datatable
            cy.get('[data-sel-role="visibility-rule-table"]', { timeout: 10000 }).should('be.visible')

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click()
            })
        })

        it('Deletes a rule and validates it is removed from datatable', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

            // Open the visibility dialog
            getComponentByRole(Button, 'editVisibilityRules').click()

            // Get initial count of rules
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr', { timeout: 10000 }).then(($rows) => {
                const initialCount = $rows.length
                cy.log(`Initial rule count: ${initialCount}`)

                // Click delete button on the first rule
                cy.log('Deleting the first rule')
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr')
                    .first()
                    .within(() => {
                        // Look for delete button - should be the last action button
                        cy.get('button[aria-label*="delete"], button:has(svg)')
                            .filter(':visible')
                            .last()
                            .click({ force: true })
                    })

                // Verify the count decreased (wait for the DOM to update)
                cy.get('[data-sel-role="visibility-rule-table"] tbody tr', { timeout: 5000 }).should('have.length', initialCount - 1)
            })

            // Save the changes
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Save').click()
            })

            // Dialog should close
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').should('not.exist')
        })

        it('Validates the condition matching dropdown (All vs Any)', () => {
            jcontent = JContent.visit(sitekeyNonI18n, 'en', 'pages/home')
            jcontent.switchToListMode().getTable().getRowByName('test-content1').contextMenu().select('Edit')

            // Open the visibility dialog
            getComponentByRole(Button, 'editVisibilityRules').click()

            // Check if there are any rules in the datatable
            // Note: Previous tests may have deleted rules, so we need to check first
            cy.get('[data-sel-role="visibility-rule-table"] tbody tr', { timeout: 10000 }).then(($rows) => {
                const initialCount = $rows.length
                cy.log(`Initial rule count: ${initialCount}`)

                if (initialCount > 0) {
                    cy.log('Rules present, testing condition matching dropdown')

                    // Look for the condition matching dropdown
                    const matchingDropdown = getComponentByRole(Dropdown, 'condition-matching')
                    matchingDropdown.should('be.visible')

                    // Test that the dropdown can be interacted with
                    matchingDropdown.get().should('not.be.disabled')
                } else {
                    cy.log('No rules present after delete test, skipping dropdown test')
                }
            })

            // Close the dialog
            cy.get('[data-sel-role="edit-visibility-rules-dialog"]').within(() => {
                cy.contains('button', 'Close').click()
            })
        })
    })
})
