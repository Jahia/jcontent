import React, {useCallback, useContext, useMemo, useState} from 'react';
import {useNotifications} from '@jahia/react-material';
import {useSiteInfo} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ApolloCacheFlushOnGWTSave} from './ApolloCacheFlushOnGWTSave';
import {ContentEditorSectionContextProvider} from '../ContentEditorSection';
import {useContentEditorConfigContext} from '../ContentEditorConfig';
import {useSelector} from 'react-redux';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {CeModalError} from '~/ContentEditor/ContentEditorApi/ContentEditorError';
import {useOnBeforeContextHooks} from '~/ContentEditor/ContentEditor/useOnBeforeContextHooks';

export const ContentEditorContext = React.createContext({});

export const useContentEditorContext = () => useContext(ContentEditorContext);

const renderError = (siteInfoResult, t, notificationContext) => {
    console.error('Error when fetching data: ' + siteInfoResult.error);
    const message = t('label.contentEditor.error.queryingContent', {details: (siteInfoResult.error.message ? siteInfoResult.error.message : '')});
    notificationContext.notify(message, ['closeButton', 'noAutomaticClose']);
    return null;
};

const useInitI18nContext = contextProps => {
    const [i18nContext, setI18nContext] = useState({
        memo: {count: 1}
    });
    // Used to reset when selecting 'create another' option in content editor
    const resetI18nContext = useCallback(() => {
        setI18nContext(prev => ({
            memo: {count: (prev.memo?.count || 0) + 1}
        }));
    }, [setI18nContext]);

    return (contextProps && contextProps.i18nContext && contextProps.setI18nContext && contextProps.resetI18nContext) ?
        contextProps : {i18nContext, setI18nContext, resetI18nContext};
};

export const ContentEditorContextProvider = ({useFormDefinition, overrides, children}) => {
    const notificationContext = useNotifications();
    const {t} = useTranslation('jcontent');
    const [errors, setErrors] = useState(null);
    const contentEditorConfigContext = useContentEditorConfigContext();
    const uiLanguage = useSelector(state => state?.uilang);
    const {i18nContext, setI18nContext, resetI18nContext} = useInitI18nContext(overrides);

    // Persist 'create another' chekbox state during language switch
    const [createAnotherValue, setCreateAnotherValue] = useState(false);
    const createAnother = useMemo(() => ({
        value: createAnotherValue, set: setCreateAnotherValue
    }), [createAnotherValue]);

    const {lang, mode, name} = contentEditorConfigContext;

    // Get user navigator locale preference
    const browserLang = navigator.language;

    const {
        loading,
        error,
        data: formDefinition,
        refetch: refetchFormData
    } = useFormDefinition();

    const {
        nodeData,
        expandedSections,
        initialValues,
        hasPreview,
        showAdvancedMode,
        details,
        technicalInfo,
        sections,
        title,
        nodeTypeName,
        nodeTypeDisplayName
    } = formDefinition || {};

    const site = nodeData?.site?.name || 'systemsite';

    const siteInfoResult = useSiteInfo({
        siteKey: site,
        displayLanguage: lang,
        uiLanguage: uiLanguage
    });

    const ranAllHooks = useOnBeforeContextHooks(
        !loading &&
        !siteInfoResult.loading &&
        !error &&
        !siteInfoResult.error ? {nodeData, siteInfo: siteInfoResult.data.jcr.result} : undefined
    );

    // Build editor context. Memoized so consumers don't re-render on every provider render.
    // Computed unconditionally (before the early returns below) to respect the rules of hooks;
    // returns null while data isn't ready, which the early returns then handle.
    const editorContext = useMemo(() => {
        if (error || siteInfoResult.error || loading || siteInfoResult.loading || !ranAllHooks) {
            return null;
        }

        return {
            path: nodeData.path,
            lang,
            browserLang,
            site,
            mode,
            name,
            siteInfo: {
                ...siteInfoResult.siteInfo,
                languages: siteInfoResult.siteInfo.languages.filter(language => language.activeInEdit)
            },
            nodeData,
            details,
            technicalInfo,
            initialValues,
            expandedSections,
            hasPreview,
            showAdvancedMode,
            title,
            nodeTypeName,
            nodeTypeDisplayName,
            refetchFormData,
            errors,
            setErrors,
            i18nContext,
            setI18nContext,
            resetI18nContext,
            createAnother
        };
    }, [
        error,
        siteInfoResult.error,
        siteInfoResult.loading,
        siteInfoResult.siteInfo,
        loading,
        ranAllHooks,
        nodeData,
        lang,
        browserLang,
        site,
        mode,
        name,
        details,
        technicalInfo,
        initialValues,
        expandedSections,
        hasPreview,
        showAdvancedMode,
        title,
        nodeTypeName,
        nodeTypeDisplayName,
        refetchFormData,
        errors,
        setErrors,
        i18nContext,
        setI18nContext,
        resetI18nContext,
        createAnother
    ]);

    if (error) {
        // Check for ItemNotFound exception
        const is404 = (error.graphQLErrors || []).some(e => e.message?.includes('ItemNotFoundException'));
        if (is404) {
            throw new CeModalError('ItemNotFoundException', {cause: error});
        }

        throw new CeModalError(error.message, {cause: error});
    }

    if (siteInfoResult.error) {
        return renderError(siteInfoResult, t, notificationContext);
    }

    if (loading || siteInfoResult.loading || !ranAllHooks) {
        return <LoaderOverlay/>;
    }

    return (
        <ContentEditorContext.Provider value={editorContext}>
            <ContentEditorSectionContextProvider formSections={JSON.parse(JSON.stringify(sections))}>
                <ApolloCacheFlushOnGWTSave/>
                {children}
            </ContentEditorSectionContextProvider>
        </ContentEditorContext.Provider>
    );
};

ContentEditorContextProvider.propTypes = {
    useFormDefinition: PropTypes.func.isRequired,
    overrides: PropTypes.object,
    children: PropTypes.node.isRequired
};

export default ContentEditorContextProvider;
