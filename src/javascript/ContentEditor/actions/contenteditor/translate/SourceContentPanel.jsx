import React, {useMemo} from 'react';
import {useResizeWatcher} from './useResizeWatcher';
import {Formik} from 'formik';
import {EditPanelLanguageSwitcher} from '../../../ContentEditor/EditPanel/EditPanelLanguageSwitcher';
import {FormBuilder} from '../../../editorTabs/EditPanelContent/FormBuilder';
import {useTranslateFormDefinition, useTranslationReadOnlyFormDefinition} from './useTranslateFormDefinition';
import {
    ContentEditorConfigContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext
} from '~/ContentEditor/contexts';
import styles from './styles.scss';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {LoaderOverlay} from '../../../DesignSystem/LoaderOverlay';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';
import {ContentEditorContextProvider, ContentEditorSectionContextProvider} from '../../../contexts';

/** Override contexts */
export const SourceContentPanel = () => {
    const ceConfigContext = useContentEditorConfigContext();
    const ceContext = useContentEditorContext();

    return (
        <SourceControlPanelInner
            baseConfig={ceConfigContext}
            baseContext={ceContext}
        />
    );
};

const SourceControlPanelInner = ({baseConfig, baseContext}) => {
    const contextConfig = useMemo(() => ({
        ...baseConfig,
        lang: baseConfig.sideBySideContext.lang,
        sideBySideContext: {
            ...baseConfig.sideBySideContext,
            enabled: true,
            readOnly: true,
            translateLang: baseConfig.lang, // editable language
            // We set this based on the editable nodeData (from baseContext), not read-only nodeData
            hasWritePermission: baseContext.nodeData?.hasWritePermission,
            lockedAndCannotBeEdited: baseContext.nodeData?.lockedAndCannotBeEdited
        }
    }), [
        baseConfig,
        baseContext.nodeData?.hasWritePermission,
        baseContext.nodeData?.lockedAndCannotBeEdited
    ]);

    console.debug(`SourceControlLang: ${contextConfig.sideBySideContext.lang}`);

    return (
        <ContentEditorConfigContextProvider config={contextConfig}>
            <SourceContentFormBuilder/>
        </ContentEditorConfigContextProvider>
    );
};

SourceControlPanelInner.propTypes = {
    baseConfig: PropTypes.shape({
        sideBySideContext: PropTypes.shape({
            lang: PropTypes.string.isRequired,
        }).isRequired,
        lang: PropTypes.string.isRequired,
        i18nContext: PropTypes.object.isRequired,
        setI18nContext: PropTypes.func.isRequired,
        resetI18nContext: PropTypes.func.isRequired
    }).isRequired,
    baseContext: PropTypes.shape({
        nodeData: PropTypes.shape({
            hasWritePermission: PropTypes.bool,
            lockedAndCannotBeEdited: PropTypes.bool
        })
    }).isRequired
};

const SourceContentFormBuilder = () => {
    const {lang, uuid, contentType} = useContentEditorConfigContext();
    const {t} = useTranslation('jcontent');
    useResizeWatcher({columnSelector: 'left-column'});

    // Fetch initial values for formik using sideBySideContext.lang from ContentEditorConfigContext
    const {data, loading, error} = useTranslationReadOnlyFormDefinition({lang, uuid, contentType});

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
    )
}
