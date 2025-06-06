import {BaseComponent, Button, Dropdown, getComponentByAttr} from '@jahia/cypress';

export class ExportDialog extends BaseComponent {
    static defaultSelector = '[data-cm-role="export-options"]';

    export(downloadsFolder:string, workspace:string = 'Staging content only', exportFormat: string = 'zip') {
        getComponentByAttr(BaseComponent, 'data-cm-role', 'export-options');
        this.should('be.visible');

        getComponentByAttr(Dropdown, 'data-cm-role', 'select-workspace', this).select(workspace);

        if (exportFormat === 'xml') {
            this.get().find('[data-cm-role="export-as-xml"] input[type="checkbox"]').should('not.be.disabled').check();
        }

        getComponentByAttr(Button, 'data-cm-role', 'export-button').click();
        this.should('not.exist');
    }
}
