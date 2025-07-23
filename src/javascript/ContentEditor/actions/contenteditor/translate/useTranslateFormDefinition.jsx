import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {useContentEditorConfigContext} from '../../../contexts';

export const useTranslateFormDefinition = () => {
    const {sbsContext} = useContentEditorConfigContext();
    const {data, refetch, loading, error, errorMessage} = useEditFormDefinition();

    if (data) {
        data.sections?.forEach(section => {
            section.fieldSets?.forEach(fieldSet => {
                fieldSet.fields = fieldSet.fields.filter(field => field.i18n === true);
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
