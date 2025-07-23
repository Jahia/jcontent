import React from 'react';
import {useResizeWatcher} from './useResizeWatcher';
import {Formik} from 'formik';
import {EditPanelLanguageSwitcher} from '../../../ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {FormBuilder} from '../../../editorTabs/EditPanelContent/FormBuilder';
import {useTranslateFormDefinition} from './useTranslateFormDefinition';
import {
    ContentEditorConfigContextProvider,
    ContentEditorContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext
} from '~/ContentEditor/contexts';
import styles from './styles.scss';

/** Override contexts */
export const SourceContentPanel = () => {
    const ceConfigContext = useContentEditorConfigContext();
    const ceContext = useContentEditorContext();

    const contextConfig = {
        ...ceConfigContext,
        lang: ceConfigContext.sbsContext.lang,
        sbsContext: {
            ...ceConfigContext.sbsContext,
            enabled: true,
            readOnly: true,
            translateLang: ceConfigContext.lang
        }
    };

    return (
        <ContentEditorConfigContextProvider config={contextConfig}>
            <ContentEditorContextProvider useFormDefinition={useTranslateFormDefinition} overrides={ceContext}>
                <SourceContentFormBuilder/>
            </ContentEditorContextProvider>
        </ContentEditorConfigContextProvider>
    );
};

const SourceContentFormBuilder = () => {
    const {initialValues, mode} = useContentEditorContext();
    useResizeWatcher({columnSelector: 'left-column'});
    return (
        <Formik initialValues={{...initialValues}}
                onSubmit={() => {
        }}
        >
            <>
                <div className={styles.languageDropDown}>
                    <span>Source language</span>
                    <EditPanelLanguageSwitcher/>
                </div>
                <FormBuilder mode={mode}/>
            </>
        </Formik>
    );
};
