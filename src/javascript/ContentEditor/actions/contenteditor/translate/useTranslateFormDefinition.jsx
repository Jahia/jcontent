import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {useContentEditorConfigContext} from '../../../contexts';

export const useTranslateFormDefinition = () => {
    const {sbsContext} = useContentEditorConfigContext();
    const {data, refetch, loading, error, errorMessage} = useEditFormDefinition();

    if (data) {
        // Display only content and SEO sections in the translation panel
        data.sections = data.sections.filter(s => ['content', 'seo'].includes(s.name));
        data.sections?.forEach(section => {
            section.fieldSets?.forEach(fieldSet => {
                fieldSet.fields.filter(field => !field.i18n).forEach(f => {
                    f.readOnly = true;
                });
                if (sbsContext.readOnly) {
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

    return {data, refetch, loading, error, errorMessage};
};
