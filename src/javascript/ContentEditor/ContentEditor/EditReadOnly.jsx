import React from 'react';
import {
    ContentEditorConfigContextProvider,
    ContentEditorContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext
} from '../contexts';
import {useEditFormDefinition} from './useEditFormDefinition';

function ReadOnlyFormBuilder({mode}) {
    const {initialValues} = useContentEditorContext();
    return (
        <Formik initialValues={{...initialValues, blah: 'readonly'}} onSubmit={() => {}}>
            <>
                <EditPanelLanguageSwitcher/>
                <FormBuilder mode={mode}/>
            </>
        </Formik>
    );
}

export function EditReadOnly({lang}) {
    const ceConfigContext = useContentEditorConfigContext();
    return (
        <ContentEditorConfigContextProvider config={{...ceConfigContext, lang: 'fr'}}>
            <ContentEditorContextProvider useFormDefinition={useEditFormDefinition}>
                <ReadOnlyFormBuilder mode={mode}/>
            </ContentEditorContextProvider>
        </ContentEditorConfigContextProvider>
    );
}
