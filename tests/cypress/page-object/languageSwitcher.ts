import {Dropdown} from '@jahia/cypress';
import {getComponent} from '@jahia/cypress';
import {Menu} from '@jahia/cypress';

export class LanguageSwitcher extends Dropdown {
    static defaultSelector = '[data-cm-role="language-switcher"]';

    // @deprecated use `selectLangByValue` instead
    selectLang(displayLang: string) {
        this.select(displayLang).get()
            .find(`span[title="${displayLang}"]`)
            .should('be.visible');
    }

    selectLangByValue(value: string): this {
        this.selectByValue(value);
        return this.isSelectedLang(value);
    }

    isSelectedLang(value: string): this {
        this.should('have.attr', 'data-selected-value', value);
        return this;
    }

    isNotSelectedLang(value: string): this {
        this.should('not.have.attr', 'data-selected-value', value);
        return this;
    }

    selectByValue(value: string): Dropdown {
        this.get().click();
        const menu = getComponent(Menu, this);
        menu.should('be.visible');
        menu.selectByValue(value);
        return this;
    }
}
