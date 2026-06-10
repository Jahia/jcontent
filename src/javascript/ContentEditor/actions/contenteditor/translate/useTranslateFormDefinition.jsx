import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';

/*
 * Custom form definition hook that adapts data for translation UI.
 * See adaptTranslateSections()
 */
export const useTranslateFormDefinition = () => {
    const {data, refetch, loading, error, errorMessage} = useEditFormDefinition();
    const transformedData = adaptTranslateSections(data);
    return {data: transformedData, refetch, loading, error, errorMessage};
};

/**
 * Adapt sections for translation mode:
 * - Expand all sections by default
 * - Set non-i18n fields as read-only
 * - If readOnly is true, set all fields and fieldsets as read-only
 */
export const adaptTranslateSections = (data, readOnly = false) => {
    if (data) {
        data.sections?.forEach(section => {
            // Expand all sections by default in translation mode
            section.expanded = true;
            if (data.expandedSections) {
                data.expandedSections[section.name] = true;
            }

            section.fieldSets?.forEach(fieldSet => {
                fieldSet.fields.filter(field => !field.i18n).forEach(f => {
                    f.readOnly = true;
                });
                if (readOnly) {
                    fieldSet.readOnly = true;
                    fieldSet.fields.forEach(field => {
                        field.readOnly = true;
                    });
                }

                if (fieldSet.fields.length === 0) {
                    fieldSet.visible = false;
                }
            });
        });
    }

    return data;
};
