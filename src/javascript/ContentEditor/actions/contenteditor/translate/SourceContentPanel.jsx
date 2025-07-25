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
import {useTranslation} from 'react-i18next';

/** Override contexts */
export const SourceContentPanel = () => {
    const ceConfigContext = useContentEditorConfigContext();
    const ceContext = useContentEditorContext();

    const contextConfig = {
        ...ceConfigContext,
        lang: ceConfigContext.sideBySideContext.lang,
        sideBySideContext: {
            ...ceConfigContext.sideBySideContext,
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
    const {t} = useTranslation('jcontent');
    useResizeWatcher({columnSelector: 'left-column'});
    return (
        <Formik initialValues={{...initialValues}}
                onSubmit={() => {
        }}
        >
            <>
                <div className={styles.languageDropDown}>
                    <span>{t('label.contentEditor.edit.action.translate.sourceLanguage')}</span>
                    <EditPanelLanguageSwitcher/>
                </div>
                <FormBuilder mode={mode}/>
            </>
        </Formik>
    );
};
