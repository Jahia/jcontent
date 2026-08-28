import {ContentEditor, JContent} from '../../../page-object';
import gql from 'graphql-tag';

describe('Language switcher tests', () => {
    const siteKey = 'digitall';
    let jcontent: JContent;
    const createText = gql`
        mutation createText {
            jcr {
                mutateNode(pathOrId: "/sites/digitall/contents") {
                    addChild(name: "lang-switcher-test", primaryNodeType: "jnt:contentFolder") {
                        addChild(
                            name: "lang-switcher-text"
                            primaryNodeType: "jnt:text"
                            properties: [{ name: "text", language: "fr", value: "bonjour" }]
                        ) {
                            uuid
                        }
                    }
                }
            }
        }
    `;

    beforeEach(() => {
        // I have issues adding these to before()/after() so have to add to beforeEach()/afterEach()
        cy.login(); // Edit in chief

        // BeforeEach()
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    afterEach(() => {
        cy.logout();
    });

    function langInGroup(elems, lang, dropdownGroup) {
        const groupText = elems
            .find(`:contains("${lang}")`)
            .parents('[data-option-type="group"]')
            .find('.moonstone-title')
            .text();
        expect(groupText).to.equals(dropdownGroup);
    }

    it('Create content - should have all language options in "Create translation" group', () => {
        const ce = jcontent.createContent('jnt:text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Simple text');

        ce.getLanguageSwitcher()
            .get()
            .click()
            .get('li.moonstone-menuItem[role="option"]')
            .should(elems => {
                expect(elems).to.have.length(3);
                langInGroup(elems, 'English', 'Create translation');
                langInGroup(elems, 'German', 'Create translation');
                langInGroup(elems, 'French', 'Create translation');
            });
    });

    it('Create content - should have edited language in "View language" group after edit', () => {
        const ce = jcontent.createContent('jnt:text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Simple text');

        // Verify English is selected by default
        ce.getLanguageSwitcher().get().find('div[aria-label="English"]').should('be.visible');

        // Type text
        ce.getSmallTextField('jnt:text_text').addNewValue('cypress-test');

        // Switch language
        ce.getLanguageSwitcher().select('German');

        // Verify language switcher
        const langSwitcher = ce.getLanguageSwitcher();
        langSwitcher
            .get()
            .click()
            .get('li.moonstone-menuItem[role="option"]')
            .should(elems => {
                expect(elems).to.have.length(3);
                langInGroup(elems, 'English', 'Switch language');
                langInGroup(elems, 'German', 'Create translation');
                langInGroup(elems, 'French', 'Create translation');
            });
    });

    it('Edit content - Should have edited language in "View language" group', () => {
        cy.apollo({mutation: createText});
        const ce = JContent.visit(siteKey, 'en', 'content-folders/contents/lang-switcher-test').editComponentByText(
            'lang-switcher-text'
        );

        // Verify language switcher
        const langSwitcher = ce.getLanguageSwitcher();
        langSwitcher
            .get()
            .click()
            .get('li.moonstone-menuItem[role="option"]')
            .should(elems => {
                expect(elems).to.have.length(3);
                langInGroup(elems, 'English', 'Add translation');
                langInGroup(elems, 'German', 'Add translation');
                langInGroup(elems, 'French', 'Switch language');
            });

        cy.apollo({
            mutation: gql`
                mutation deleteContent {
                    jcr {
                        deleteNode(pathOrId: "/sites/digitall/contents/lang-switcher-test")
                    }
                }
            `
        });
    });

    it('Create content - should not leak unsaved text into another language after switching', () => {
        // The form definition is refetched on every language switch; waiting on it anchors each
        // assertion after the reload, so an empty field cannot pass on a transient state.
        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('createForm')) {
                req.alias = 'createForm';
            }
        });

        const ce: ContentEditor = jcontent.createContent('jnt:text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Simple text');
        cy.wait('@createForm');

        cy.log('Type text in English without saving');
        ce.getSmallTextField('jnt:text_text').addNewValue('Cypress test - unsaved English text');

        cy.log('Switch language to French without saving the English text first');
        ce.getLanguageSwitcher().select('French');
        cy.wait('@createForm');

        cy.log('The French field must start empty, not carry over the unsaved English text');
        ce.getSmallTextField('jnt:text_text').checkValue('');

        // Without this, a regression that cleared every i18n field on every update would still
        // pass the assertion above while destroying the text typed in English.
        cy.log('Switching back must restore the English text, not clear it too');
        ce.getLanguageSwitcher().select('English');
        cy.wait('@createForm');
        ce.getSmallTextField('jnt:text_text').checkValue('Cypress test - unsaved English text');
    });

    it('Edit content - should show the target language translation, not unsaved text from the previous one', () => {
        // A previous failed run may have left the folder behind; cy.apollo tolerates the error
        cy.apollo({
            mutation: gql`
                mutation cleanupBefore {
                    jcr {
                        deleteNode(pathOrId: "/sites/digitall/contents/lang-switcher-edit-test")
                    }
                }
            `
        });

        cy.apollo({
            mutation: gql`
                mutation createBilingualText {
                    jcr {
                        mutateNode(pathOrId: "/sites/digitall/contents") {
                            addChild(name: "lang-switcher-edit-test", primaryNodeType: "jnt:contentFolder") {
                                addChild(
                                    name: "lang-switcher-bilingual"
                                    primaryNodeType: "jnt:text"
                                    properties: [
                                        {name: "text", language: "en", value: "saved english"}
                                        {name: "text", language: "fr", value: "saved french"}
                                    ]
                                ) {
                                    uuid
                                }
                            }
                        }
                    }
                }
            `
        });

        // The form definition is refetched on every language switch; waiting on it anchors each
        // assertion after the reload rather than on the still-displayed previous language.
        cy.intercept('POST', '**/modules/graphql', req => {
            if (JSON.stringify(req.body).includes('editForm')) {
                req.alias = 'editForm';
            }
        });

        // The content table labels a jnt:text row with its text value, not its system name
        const ce = JContent.visit(siteKey, 'en', 'content-folders/contents/lang-switcher-edit-test')
            .editComponentByText('saved english');

        cy.log('English shows its saved value');
        ce.getSmallTextField('jnt:text_text').checkValue('saved english');

        cy.log('Type over it without saving, then switch to French');
        ce.getSmallTextField('jnt:text_text').addNewValue('unsaved english edit');
        ce.getLanguageSwitcher().select('French');
        cy.wait('@editForm');

        cy.log('French must show its own saved translation - not the unsaved English text, and not blank');
        ce.getSmallTextField('jnt:text_text').checkValue('saved french');

        cy.log('Switching back keeps the unsaved English edit');
        ce.getLanguageSwitcher().select('English');
        cy.wait('@editForm');
        ce.getSmallTextField('jnt:text_text').checkValue('unsaved english edit');

        cy.apollo({
            mutation: gql`
                mutation deleteContent {
                    jcr {
                        deleteNode(pathOrId: "/sites/digitall/contents/lang-switcher-edit-test")
                    }
                }
            `
        });
    });

    it('Create content - saves multiple languages', () => {
        const contentName = 'langSwitcherMultipleLang';
        const ce: ContentEditor = jcontent.createContent('jnt:text');
        cy.get('#contenteditor-dialog-title').should('be.visible').and('contain', 'Create Simple text');

        cy.log('Fill text in english');
        const enText = 'Cypress test - English';
        ce.getLanguageSwitcher()
            .get()
            .find('div[aria-label="English"]')
            .should('be.visible')
            .log('Language set to English');
        ce.getSmallTextField('jnt:text_text').addNewValue(enText);

        cy.log('Fill text in French');
        const frText = 'Cypress test - French';
        ce.getLanguageSwitcher()
            .select('French')
            .get()
            .find('div[aria-label="French"]')
            .should('be.visible')
            .log('Language set to French');
        ce.getSmallTextField('jnt:text_text').addNewValue(frText);

        ce.openSection('options');
        ce.getSmallTextField('nt:base_ce:systemName', false).addNewValue(contentName);
        ce.create();

        cy.log('Verify text has been created in jcr');
        const query = gql`
            query ($path: String!) {
                jcr {
                    nodeByPath(path: $path) {
                        en: property(name: "text", language: "en") {
                            value
                        }
                        fr: property(name: "text", language: "fr") {
                            value
                        }
                    }
                }
            }
        `;
        const path = `/sites/${siteKey}/contents/${contentName}`;
        cy.apollo({query, variables: {path}}).should(result => {
            expect(result?.data?.jcr?.nodeByPath?.en?.value).equals(enText);
            expect(result?.data?.jcr?.nodeByPath?.fr?.value).equals(frText);
        });

        cy.log('Cleanup');
        cy.apollo({
            mutation: gql`
                mutation ($path: String!) {
                    jcr {
                        deleteNode(pathOrId: $path)
                    }
                }
            `,
            variables: {path}
        });
    });
});
