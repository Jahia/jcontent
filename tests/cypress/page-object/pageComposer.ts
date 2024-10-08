import {BasePage, getComponent} from '@jahia/cypress';
import {ContentEditor} from './contentEditor';
import {PageComposerContextualMenu} from './pageComposerContextualMenu';
import {ContentTypeSelector} from './createContent';
import IframeOptions = Cypress.IframeOptions;

export class PageComposer extends BasePage {
    iFrameOptions: IframeOptions;

    constructor() {
        super();
        this.iFrameOptions = {timeout: 90000, log: true};
    }

    static visit(site: string, language: string, path: string): PageComposer {
        cy.visit(`/jahia/page-composer/default/${language}/sites/${site}/${path}`);
        return new PageComposer();
    }

    static visitLive(site: string, language: string, path: string): PageComposer {
        cy.visit(`${Cypress.env('JAHIA_URL')}/${language}/sites/${site}/${path}`);
        return new PageComposer();
    }

    openCreateContent(): PageComposer {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                cy.get('.container').contains('Any content').click({force: true});
            });
        });
        return this;
    }

    createContent(contentType: string): ContentEditor {
        this.openCreateContent()
            .getContentTypeSelector()
            .searchForContentType(contentType)
            .selectContentType(contentType)
            .create();
        return new ContentEditor();
    }

    refresh() {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('.window-actions-refresh').click();
        });
        return this;
    }

    shouldContain(text: string) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                cy.get('.container').should('contain', text);
            });
        });
    }

    componentShouldBeVisible(selector: string) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                cy.get('.container').find(selector).should('exist').scrollIntoView();
                cy.get('.container').find(selector).should('be.visible');
            });
        });
    }

    editComponent(selector: string) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(5000);
                cy.get('.container').find(selector).trigger('mouseover');
                cy.get('.container').find(selector).rightclick({force: true});
            });
        });
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('.editModeContextMenu').scrollIntoView();
            cy.get('.editModeContextMenu').contains('Edit').click();
        });
        return new ContentEditor();
    }

    editComponentByText(text: string): ContentEditor {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(5000);
                cy.get('.container').contains(text).trigger('mouseover');
                cy.get('.container').contains(text).rightclick({force: true});
            });
        });
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('.editModeContextMenu').scrollIntoView();
            cy.get('.editModeContextMenu').contains('Edit').click();
        });
        return new ContentEditor();
    }

    openContextualMenuOnContent(selector: string) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.waitUntil(
                () => {
                    cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                        // eslint-disable-next-line cypress/no-unnecessary-waiting
                        cy.wait(5000);
                        cy.get(selector).click();
                        cy.get(selector).rightclick({waitForAnimations: true});
                    });
                    return cy.get('.editModeContextMenu').then(element => expect(element).to.be.not.null);
                },
                {
                    errorMsg: 'Menu not opened in required time',
                    timeout: 10000,
                    interval: 1000
                }
            );
        });

        return new PageComposerContextualMenu('.editModeContextMenu');
    }

    getContentTypeSelector(): ContentTypeSelector {
        return getComponent(ContentTypeSelector);
    }

    shouldContainWIPOverlay() {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                cy.get('.workinprogress-overlay').should('contain', 'Work in progress');
            });
        });
    }

    editPage(title: string): ContentEditor {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('#JahiaGxtPagesTab').contains(title).rightclick({force: true});
            cy.get('.pagesContextMenuAnthracite').contains('Edit').click({force: true});
        });
        return new ContentEditor();
    }

    createPage(title: string, implicitSync?: boolean): ContentEditor {
        const ce = new ContentEditor();
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('#JahiaGxtPagesTab').contains('Home').rightclick({force: true});
            cy.get('.pagesContextMenuAnthracite').contains('New page').click({force: true});
        });

        cy.get('#jnt\\:page_jcr\\:title').should('be.visible').type(title, {force: true});
        if (implicitSync) {
            cy.get('#nt\\:base_ce\\:systemName').should('be.visible').type(title, {force: true});
        }

        cy.get('#select-jmix\\:hasTemplateNode_j\\:templateName')
            .should('be.visible')
            .click();
        cy.get('#select-jmix\\:hasTemplateNode_j\\:templateName')
            .find('li[role="option"][data-value="home"]')
            .click();

        ce.createUnchecked();
        return ce;
    }

    checkSystemNameSync(title: string, expectedSystemName: string): ContentEditor {
        const ce = new ContentEditor();
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('#JahiaGxtPagesTab').contains('Home').rightclick({force: true});
            cy.get('.pagesContextMenuAnthracite').contains('New page').click({force: true});
        });

        cy.get('#jnt\\:page_jcr\\:title').should('be.visible').type(title, {force: true});
        cy.get('#select-jmix\\:hasTemplateNode_j\\:templateName')
            .should('be.visible')
            .click();
        cy.get('#select-jmix\\:hasTemplateNode_j\\:templateName')
            .find('li[role="option"][data-value="home"]')
            .click();

        cy.get('#nt\\:base_ce\\:systemName').should('have.value', expectedSystemName);

        ce.cancelAndDiscard();
        return ce;
    }

    navigateToPage(name: string): PageComposer {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('#JahiaGxtPagesTab').find('span').contains(name).click({force: true});
        });

        return new PageComposer();
    }

    switchLanguage(language: string) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            // Seems necessary with the flicker on changing language
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(5000).then(() => {
                cy.get('.toolbar-itemsgroup-languageswitcher').should('be.visible').click();
                cy.get('.x-combo-list-item').contains(language).click();
            });
        });
    }

    doInsideInnerFrame(fcn: () => void) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                fcn();
            });
        });
    }

    publish(menuEntry: string, selectorText: string) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get('.edit-menu-publication').click({force: true});
            cy.get('.menu-edit-menu-publication').find('span').contains(menuEntry).click();
            cy.get('button').contains(selectorText).click();
        });
    }
}
