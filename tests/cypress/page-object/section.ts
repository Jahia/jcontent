import {Collapsible} from '@jahia/cypress';

export class Section extends Collapsible {
    sectionName: string;
    sectionLabel: string;

    getField(fieldName: string) {
        return this.get().find(`[data-sel-content-editor-field="${fieldName}"]`);
    }
}
