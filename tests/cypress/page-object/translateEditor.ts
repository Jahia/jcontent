import {ContentEditor} from "./contentEditor";
import {JContent} from "./jcontent";
import {Field} from "./fields";
import {ComponentType} from "@jahia/cypress/src/page-object/baseComponent";
import {BaseComponent, getComponent, getComponentByAttr, getComponentBySelector} from "@jahia/cypress";
import {LanguageSwitcher} from "./languageSwitcher";

export class TranslateEditor extends ContentEditor {

    sourceColumnComponent: BaseComponent;
    translateColumnComponent: BaseComponent;

    advancedMode: boolean = true;

    static visitContent(siteKey: string, lang: string, path: string, name) {
        const jcontent = JContent.visit(siteKey, lang, path).switchToListMode();
        jcontent.getTable()
            .getRowByName(name)
            .contextMenu()
            .selectByRole('sbsTranslate');
        return new TranslateEditor();
    }

    static visitPage(siteKey: string, lang: string, path: string, name) {
        const jcontent = JContent.visit(siteKey, lang, path);
        const menu = jcontent.getAccordionItem('pages').getTreeItem(name).contextMenu();
        menu.shouldHaveRoleItem('sbsTranslate');
        menu.selectByRole('sbsTranslate');
        return new TranslateEditor();
    }

    getSourceColumn(): BaseComponent {
        if (!this.sourceColumnComponent) {
            this.sourceColumnComponent = new BaseComponent(cy.get('[data-sel-role="left-column"]'));
        }
        return this.sourceColumnComponent;
    }

    getTranslateColumn(): BaseComponent {
        if (!this.translateColumnComponent) {
            this.translateColumnComponent = new BaseComponent(cy.get('[data-sel-role="right-column"]'));
        }
        return this.translateColumnComponent;
    }

    getSourceFields(): Cypress.Chainable {
        return this.getSourceColumn().get().find('[data-sel-content-editor-field]');
    }

    getTranslateFields(): Cypress.Chainable {
        return this.getTranslateColumn().get().find('[data-sel-content-editor-field]');
    }

    getSourceField<FieldType extends Field>(FieldComponent: ComponentType<FieldType>, fieldName: string): Field {
        return getComponentByAttr(FieldComponent, 'data-sel-content-editor-field', fieldName, this.getSourceColumn());
    }

    getTranslateField<FieldType extends Field>(FieldComponent: ComponentType<FieldType>, fieldName: string): Field {
        return getComponentByAttr(FieldComponent, 'data-sel-content-editor-field', fieldName, this.getTranslateColumn());
    }

    getSourceLanguageSwitcher() {
        return this.getMultiLanguageSwitcher(this.getSourceColumn());
    }

    getTranslateLanguageSwitcher() {
        return this.getMultiLanguageSwitcher(this.getTranslateColumn());
    }

    getMultiLanguageSwitcher(parent: BaseComponent): LanguageSwitcher {
        return getComponentBySelector(LanguageSwitcher, '[data-cm-role="language-switcher"]', parent);
    }
}
