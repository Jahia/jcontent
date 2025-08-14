import React from 'react';
import {useTranslation} from 'react-i18next';
import {useResizeWatcher} from '../useResizeWatcher';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {ContentEditorSectionContextProvider, useContentEditorConfigContext} from '~/ContentEditor/contexts';
import {Formik} from 'formik';
import styles from '../styles.scss';
import {EditPanelLanguageSwitcher} from '~/ContentEditor/ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {FormBuilder} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';
import {useTranslationReadOnlyFormDefinition} from './useTranslateReadOnlyFormDefinition';
import PropTypes from 'prop-types';

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

    return (
        <Formik initialValues={{...data?.initialValues}}
                onSubmit={() => {
                }}
        >
            <>
                <div className={styles.languageDropDown}>
                    <span>{t('label.contentEditor.edit.action.translate.sourceLanguage')}</span>
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
