import {type FragmentOf, readFragment} from 'gql';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {ContentEditorFragment} from './fragments.js';

/**
 * Transforms a GqlEditorForm object into sections consumable by Content Editor.
 */
export function adaptSections(
    data: FragmentOf<typeof ContentEditorFragment>,
    {readOnly = false}: {
        /** Mark every field and fieldset read-only */
        readOnly?: boolean;
    } = {}
) {
    const {sections} = readFragment(ContentEditorFragment, data);
    return sections
        .map(section => {
            const sourceFieldSets =
                section.name === 'metadata' ?
                    section.fieldSets.filter(fieldSet => !fieldSet.fields.some(f => f.readOnly)) :
                    section.fieldSets;

            const fieldSets = sourceFieldSets.map(fieldSet => {
                const fields = fieldSet.fields.map(field => ({
                    ...field,
                    // Store fieldSet original inside the field, useful for testing the nodeType declaring this prop
                    nodeType: fieldSet.name,
                    // Generate input name
                    name: field.name === 'ce:systemName' ? Constants.systemName.name : fieldSet.name + '_' + field.name,
                    // JCR property name, used for saving
                    propertyName: field.name,
                    readOnly: readOnly || field.readOnly
                }));

                return {
                    ...fieldSet,
                    fields,
                    readOnly: readOnly || fieldSet.readOnly
                };
            });

            return {...section, fieldSets};
        })
        .filter(section => section.name === 'listOrdering' || section.fieldSets.length > 0);
}

/** Utility function to return an object of expanded status for the given sections. */
export const getExpandedSections = (sections: Array<{ name: string; expanded: boolean }>) =>
    Object.fromEntries(sections.map(section => [section.name, section.expanded]));
