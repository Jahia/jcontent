import {BaseComponent, Button, getComponentBySelector} from '@jahia/cypress';
import {JContent} from './jcontent';

const ROOT_SELECTOR = '[data-cm-role="tag-manager-root"]';

export class TagManager extends JContent {
    constructor(base?: JContent) {
        super();
        if (base) {
            Object.assign(this, base);
        }
    }

    static visit(site: string, language = 'en'): TagManager {
        JContent.visit(site, language, 'apps/tagsmanager');
        cy.get(ROOT_SELECTOR).should('be.visible');
        return new TagManager(new JContent());
    }

    static openFromAdditionalApps(site: string, language = 'en'): TagManager {
        const jcontent = JContent.visit(site, language, 'pages/home');
        jcontent.getAccordionItem('apps').click();
        jcontent.getAccordionItem('apps').getTreeItem('tagsmanager').get().should('be.visible').click();
        cy.get(ROOT_SELECTOR).should('be.visible');
        return new TagManager(jcontent);
    }

    getRoot(): BaseComponent {
        return getComponentBySelector(BaseComponent, ROOT_SELECTOR);
    }

    getSearchInput() {
        return cy.get('[data-cm-role="tag-manager-search"]').find('input');
    }

    search(term: string): TagManager {
        this.getSearchInput().clear().type(term);
        return this;
    }

    clearSearch(): TagManager {
        this.getSearchInput().clear();
        return this;
    }

    getRow(tagName: string) {
        return cy.contains('[data-cm-role="tag-manager-row"]', tagName).should('be.visible');
    }

    clickRowAction(tagName: string, actionRole: string): TagManager {
        this.getRow(tagName).within(() => {
            cy.get(`button[data-cm-role="${actionRole}"]`).click();
        });
        return this;
    }

    openUsages(tagName: string): TagManager {
        return this.clickRowAction(tagName, 'tag-manager-view');
    }

    openRename(tagName: string): TagManager {
        return this.clickRowAction(tagName, 'tag-manager-rename');
    }

    openDelete(tagName: string): TagManager {
        return this.clickRowAction(tagName, 'tag-manager-delete');
    }

    getDrawer() {
        return cy.get('[data-cm-role="tag-manager-drawer"]');
    }

    getDrawerItem(nodePath: string) {
        return cy.get(`[data-cm-role="tag-manager-drawer-item"][data-node-path="${nodePath}"]`);
    }

    closeDrawerByClickAway(): TagManager {
        cy.get('[data-cm-role="tag-manager-drawer-layer"]').click('topLeft');
        return this;
    }

    openEditNodeTag(nodePath: string): TagManager {
        this.getDrawerItem(nodePath).within(() => {
            cy.get('button[data-cm-role="tag-manager-edit-node-tag"]').click();
        });
        return this;
    }

    openDeleteNodeTag(nodePath: string): TagManager {
        this.getDrawerItem(nodePath).within(() => {
            cy.get('button[data-cm-role="tag-manager-delete-node-tag"]').click();
        });
        return this;
    }

    fillRenameDialog(value: string): TagManager {
        cy.get('[data-cm-role="tag-manager-rename-dialog"]').should('be.visible');
        cy.get('[data-cm-role="tag-manager-rename-input"]').find('input').clear().type(value);
        return this;
    }

    confirmRename(): TagManager {
        getComponentBySelector(Button, 'button[data-cm-role="tag-manager-confirm-rename"]').click();
        return this;
    }

    fillEditNodeDialog(value: string): TagManager {
        cy.get('[data-cm-role="tag-manager-edit-node-dialog"]').should('be.visible');
        cy.get('[data-cm-role="tag-manager-edit-node-input"]').find('input').clear().type(value);
        return this;
    }

    confirmEditNode(): TagManager {
        getComponentBySelector(Button, 'button[data-cm-role="tag-manager-confirm-edit-node"]').click();
        return this;
    }

    confirmDelete(): TagManager {
        cy.get('[data-cm-role="tag-manager-delete-dialog"]').should('be.visible');
        getComponentBySelector(Button, 'button[data-cm-role="tag-manager-confirm-delete"]').click();
        return this;
    }

    confirmDeleteNode(): TagManager {
        cy.get('[data-cm-role="tag-manager-delete-node-dialog"]').should('be.visible');
        getComponentBySelector(Button, 'button[data-cm-role="tag-manager-confirm-delete-node"]').click();
        return this;
    }
}
