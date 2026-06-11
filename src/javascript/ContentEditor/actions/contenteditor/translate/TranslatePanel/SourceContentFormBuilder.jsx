import React from 'react';
import {useTranslation} from 'react-i18next';
import {useResizeWatcher} from '../useResizeWatcher';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {
    ContentEditorSectionContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext
} from '~/ContentEditor/contexts';
import {Formik} from 'formik';
import {FormBuilder} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/FormBuilder';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';
import {useTranslationReadOnlyFormDefinition} from './useTranslateReadOnlyFormDefinition';
import PropTypes from 'prop-types';
import {EditPanelLanguageSwitcher, useSwitchLanguage} from '~/shared';
import {Typography} from '@jahia/moonstone';
import styles from '../styles.scss';

/**
 * Displays read-only content from a source language on translation panel UI.
 * This component bypasses the ContentEditorContext for fetching data as it causes rendering loop issues,
 * and opted to fetch data directly using the useTranslationReadOnlyFormDefinition hook.
 */
export const SourceContentFormBuilder = () => {
    const {lang, uuid, contentType} = useContentEditorConfigContext();
    useResizeWatcher({columnSelector: 'left-column'});

     const {
        data,
        loading,
        error
    } = useTranslationReadOnlyFormDefinition({lang, uuid, contentType});

    if (loading) {
        return <LoaderOverlay/>;
    }

    if (error) {
        throw new CeModalError(error.message, {cause: error});
    }

    return (
        <ContentEditorSectionContextProvider formSections={data?.sections}>
            <SourceContentFormBuilderInner data={data}/>
        </ContentEditorSectionContextProvider>
    );
};

/**
 * Renders the actual form UI for the source content in a translation workflow.
 * This inner component is needed to control the rendering of the form only when data is fetched and available.
 * This is necessary in order to properly align the fields using useResizeWatcher.
 */
const SourceContentFormBuilderInner = ({data}) => {
    const {t} = useTranslation('jcontent');
    useResizeWatcher({columnSelector: 'left-column', data});
    const switchLanguage = useSwitchLanguage();
    const {lang} = useContentEditorConfigContext();

    const {i18nContext, nodeData, siteInfo} = useContentEditorContext();
    const sourceLanguages = [];
    const missingTranslationLanguages = [];

    for (const siteLang of siteInfo.languages) {
        const isTranslated =
            nodeData?.translationLanguages?.includes(siteLang.language) ||
            // Check if a translation during create is empty or not
            Object.values(i18nContext[siteLang.language]?.values || {}).some(Boolean);
        if (isTranslated) {
            sourceLanguages.push(siteLang);
        } else {
            missingTranslationLanguages.push(siteLang);
        }
    }

    return (
        <Formik initialValues={data?.initialValues} onSubmit={() => {}}>
            <>
                <div className={styles.languageDropDown}>
                    <span>
                        {t(
                            'label.contentEditor.edit.action.translate.sourceLanguage'
                        )}
                    </span>
                    <EditPanelLanguageSwitcher/>
                </div>
                <FormBuilder mode="edit"/>
            </>
        </Formik>
    );
};

SourceContentFormBuilderInner.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.shape({
            initialValues: PropTypes.object,
            sections: PropTypes.array
        }),
        PropTypes.oneOf([null])
    ])
};
