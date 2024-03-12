import {BaseComponent, getComponentBySelector} from '@jahia/cypress';

export class PickerGrid extends BaseComponent {
    getCardByName(name: string) {
        return getComponentBySelector(GridCard, `[data-sel-role-card="${name}"]`, this);
    }
}

export class GridCard extends BaseComponent {
    static defaultSelector = '[data-cm-role="grid-content-list-card"]';

    click() {
        return this.get().click();
    }
}

