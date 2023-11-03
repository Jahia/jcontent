import {BaseComponent} from '@jahia/cypress';

export class DeleteDialog extends BaseComponent {
    static defaultSelector = 'div[data-sel-role="delete-mark-dialog"]';

    markForDeletion() {
        this.get().find('[data-sel-role="delete-mark-button"]').click();
    }
}
