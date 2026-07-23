import {createSite, createUser, deleteSite, deleteUser, grantRoles} from '@jahia/cypress';
import {ContentEditor, JContent} from '../../page-object';

const testCaseId = '2209014';
const logFileName = 'publication-permissions-progress.log';

const logProgress = (message: string) => {
    const line = `[${testCaseId}][PublicationTest] ${message}`;
    cy.log(line);
    cy.writeFile(`results/reports/${logFileName}`, `${line}\n`, {flag: 'a+'});
};

describe('Publication permissions', () => {
    const suffix = Date.now().toString();
    const siteKey = `publicationPermissions${suffix}`;
    const editor = {username: `pubEditor${suffix}`, password: 'password'};
    const translator = {username: `pubTranslator${suffix}`, password: 'password'};
    const text = `New content ${suffix}`;
    const rowName = `publication-permissions-${suffix}`;

    const updateTranslatorRolePermission = (action: 'add' | 'remove') => {
        cy.executeGroovy('contentEditor/updateRolePermission.groovy', {
            ACTION: action,
            ROLE: 'translator',
            PERMISSION: 'publication-start',
            TARGET_NODE: 'currentSite-workflow'
        });
    };

    const openContentEditor = (username: string, password: string) => {
        cy.login(username, password);
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const contentEditor = jcontent.editComponentByRowName(rowName);
        contentEditor.switchToAdvancedMode();
        return contentEditor;
    };

    const assertPublishMenuAction = (role: string, enabled: boolean) => {
        cy.get('[data-sel-role="jcontent-publishMenu"]').then($menu => {
            const item = $menu.find(`.moonstone-menuItem[data-sel-role="${role}"]`);

            if (enabled) {
                expect(item.length, `expected ${role} menu item to exist`).to.eq(1);
                expect(item.attr('aria-disabled'), `expected ${role} menu item to be enabled`).to.eq('false');
                return;
            }

            if (item.length === 0) {
                expect(item.length, `expected ${role} menu item to be absent when disabled`).to.eq(0);
                return;
            }

            expect(item.attr('aria-disabled'), `expected ${role} menu item to be disabled`).to.eq('true');
        });
    };

    const assertActionsState = (
        contentEditor: ContentEditor,
        saveEnabled: boolean,
        publishEnabled: boolean,
        unpublishEnabled: boolean,
        requestPublicationEnabled: boolean,
        requestPublicationHeaderMenuEnabled: boolean,
        publishInMenuEnabled: boolean,
    ) => {
        contentEditor.checkButtonStatus('submitSave', saveEnabled);

        if (publishEnabled) {
            contentEditor.checkButtonStatus('publishAction', true);
        } else {
            cy.get('button[data-sel-role="publishAction"]').should('not.exist');
        }

        if (requestPublicationEnabled) {
            cy.get('button[data-sel-role="startWorkflowMainButton"]').should('be.visible').and('not.be.disabled');
        } else {
            cy.get('button[data-sel-role="startWorkflowMainButton"]').should('not.exist');
        }

        cy.get('button[data-sel-role="ContentEditorHeaderMenu"]')
            .should('be.visible')
            .and('not.be.disabled')
            .click();

        cy.get('[data-sel-role="jcontent-publishMenu"]').should('be.visible');

        assertPublishMenuAction('publish', publishInMenuEnabled);
        assertPublishMenuAction('publishInAllLanguages', publishInMenuEnabled);
        assertPublishMenuAction('unpublish', unpublishEnabled);

        // The current React content editor does not register a header-menu action for
        // request publication; the workflow action is exposed only as the main button.
        const requestPublicationInHeaderMenu =
            '.moonstone-menuItem[data-sel-role="startWorkflow"],' +
            '.moonstone-menuItem[data-sel-role="startWorkflowMainButton"]';

        if (requestPublicationHeaderMenuEnabled) {
            cy.get('[data-sel-role="jcontent-publishMenu"]')
                .find(requestPublicationInHeaderMenu)
                .should('have.length.at.least', 1)
                .and($items => {
                    expect($items.toArray().some(item => item.getAttribute('aria-disabled') === 'false')).to.eq(true);
                });
        } else {
            cy.get('[data-sel-role="jcontent-publishMenu"]')
                .find(requestPublicationInHeaderMenu)
                .should('have.length', 0);
        }

        cy.get('body').click(0, 0);
    };

    before(() => {
        logProgress('before: creating multilingual site and users');
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'dx-base-demo-templates',
            serverName: 'localhost',
            locale: 'en'
        });
        createUser(editor.username, editor.password, [{name: 'preferredLanguage', value: 'en'}]);
        createUser(translator.username, translator.password, [{name: 'preferredLanguage', value: 'en'}]);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.username, 'USER');
        grantRoles(`/sites/${siteKey}`, ['translator-en'], translator.username, 'USER');
    });

    after(() => {
        logProgress('after: restoring translator publication permission and cleaning test data');
        updateTranslatorRolePermission('add');
        cy.logout();
        deleteUser(editor.username);
        deleteUser(translator.username);
        deleteSite(siteKey);
    });

    it('mirrors PublicationTest no-publication-right behavior with separate publish menu assertions', {
        env: {
            testCaseId,
            testTags: ['content-editor', 'publication', 'permissions', 'selenium-migration']
        }
    }, () => {
        logProgress('step 1: login as editor and create a simple text content');
        cy.login(editor.username, editor.password);
        let jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        const createContentEditor = jcontent.createContent('jnt:text');
        createContentEditor.getSmallTextField('jnt:text_text').addNewValue(text);
        createContentEditor.openSection('options');
        createContentEditor.getSmallTextField('nt:base_ce:systemName', false).addNewValue(rowName);
        createContentEditor.create();

        logProgress('step 2: reopen content editor as editor and check request-publication state');
        cy.logout();
        let contentEditor = openContentEditor(editor.username, editor.password);
        assertActionsState(contentEditor, false, false, false, true, false, true);

        logProgress('step 3: remove publication-start from translator role');
        cy.logout();
        cy.login();
        updateTranslatorRolePermission('remove');
        cy.logout();

        logProgress('step 4: reopen content editor as translator and verify publication actions are not enabled');
        contentEditor = openContentEditor(translator.username, translator.password);
        assertActionsState(contentEditor, false, false, false, false, false, false);

        logProgress('verification: current-language and all-languages publish actions were checked independently');
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.getTable().getRowByName(rowName).should('contain.text', text);
    });
});