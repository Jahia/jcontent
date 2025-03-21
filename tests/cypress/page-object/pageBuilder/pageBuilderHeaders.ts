import {BaseComponent} from '@jahia/cypress';

export class PageBuilderHeaders extends BaseComponent {
    items() {
        return this.get().find('div');
    }
}
