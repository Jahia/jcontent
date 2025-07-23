import {BaseComponent, getComponentByRole} from '@jahia/cypress';

export class PageBuilderModuleFooter extends BaseComponent {
    static defaultSelector = '[jahiatype="footer"]';

    getItemPathDropdown(): ItemPathDropdown {
        return getComponentByRole(ItemPathDropdown, 'pagebuilder-itempath-dropdown', this);
    }
}

export class ItemPathDropdown extends BaseComponent {
    static defaultSelector = '[data-sel-role="pagebuilder-itempath-dropdown"]';

    open(): ItemPathDropdown {
        this.element.click({waitForAnimations: true});
        return this;
    }

    shouldHaveCount(length: number) {
        this.get().find('[role="list"] [role="option"]').should('have.length', length);
    }

    select(item: string) {
        this.get().find('[role="list"] [role="option"]').contains(item).click({force: true});
    }
}
