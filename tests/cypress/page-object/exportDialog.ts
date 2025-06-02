import {BaseComponent, Button, Dropdown, getComponentByAttr} from '@jahia/cypress';

export class ExportDialog extends BaseComponent {
    static defaultSelector = 'button[data-sel-role="breadcrumb-item"]';

    export(downloadsFolder:string, workspace:string = 'Staging content only', exportFormat: string = 'zip') {
        const dialog = getComponentByAttr(BaseComponent, 'data-cm-role', 'export-options');
        dialog.should('be.visible');

        getComponentByAttr(Dropdown, 'data-cm-role', 'select-workspace', dialog).select(workspace);

        if (exportFormat === 'xml') {
            dialog.get().find('[data-cm-role="export-as-xml"] input[type="checkbox"]').should('not.be.disabled').check();
        }

        getComponentByAttr(Button, 'data-cm-role', 'export-button').click();
        dialog.should('not.exist');
    }
}
