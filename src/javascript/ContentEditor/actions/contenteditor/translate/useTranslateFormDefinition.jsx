import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {useContentEditorConfigContext} from '../../../contexts';

export const useTranslateFormDefinition = () => {
    const {readOnly} = useContentEditorConfigContext();
    const {data, refetch, loading, error, errorMessage} = useEditFormDefinition();

    if (data) {
        data.sections?.forEach(section => {
            section.fieldSets?.forEach(fieldSet => {
                fieldSet.fields = fieldSet.fields.filter(field => field.i18n === true);
                if (readOnly) {
                    fieldSet.fields.forEach(field => field.readOnly = true);
                }

                // If (fieldSet.fields.length === 0) {
                //     fieldSet.visible = false;
                // }
            });
        });
    }

    return {data, refetch, loading, error, errorMessage};
};
