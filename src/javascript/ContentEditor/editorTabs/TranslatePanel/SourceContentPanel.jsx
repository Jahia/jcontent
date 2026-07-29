import React, {useMemo} from 'react';
import {
    ContentEditorConfigContextProvider,
    useContentEditorConfigContext,
    useContentEditorContext
} from '~/ContentEditor/contexts';
import PropTypes from 'prop-types';
import {SourceContentFormBuilder} from './SourceContentFormBuilder';
import {getBestSourceLanguage} from '~/ContentEditor/utils/translateLanguages';

/**
 * Wrapper component for displaying the source content in a translation workflow.
 * This component extracts the current configuration and content editor contexts
 * and passes them to the inner component that will override them for source content display.
 * This is done in order to be able to memoize the context configuration and avoid unnecessary re-renders.
 */
export const SourceContentPanel = () => {
    const ceConfigContext = useContentEditorConfigContext();
    const ceContext = useContentEditorContext();

    return (
        <SourceContentPanelInner
            baseConfig={ceConfigContext}
            baseContext={ceContext}
        />
    );
};

/**
 * Configures and renders the source content panel with the appropriate context for translation.
 * This component:
 * - Creates a modified configuration context for translation purposes
 * - Sets up the side-by-side context with the source language
 * - Configures read-only mode for the source content
 * - Preserves permission information from the original context
 * - Renders the SourceContentFormBuilder with overridden configuration
 */
const SourceContentPanelInner = ({baseConfig, baseContext}) => {
    const contextConfig = useMemo(() => {
        const translationLanguages = baseContext.nodeData?.translationLanguages;
        const targetLanguage = baseConfig.lang; // Editable language
        const explicitSourceLanguage = baseConfig.sideBySideContext?.lang;
        const defaultLanguage = baseContext.siteInfo?.defaultLanguage;

        // Pick the source language that makes the most sense for the user
        const sourceLanguage = (explicitSourceLanguage && explicitSourceLanguage !== targetLanguage) ?
            explicitSourceLanguage :
            getBestSourceLanguage(
                targetLanguage,
                [...(translationLanguages || [])].sort((a, z) => a.localeCompare(z)),
                defaultLanguage
            );

        return {
            ...baseConfig,
            lang: sourceLanguage,
            sideBySideContext: {
                ...baseConfig.sideBySideContext,
                lang: sourceLanguage,
                enabled: true,
                readOnly: true,
                translateLang: targetLanguage,
                // We set this based on the editable nodeData (from baseContext), not read-only nodeData
                hasWritePermission: baseContext.nodeData?.hasWritePermission,
                lockedAndCannotBeEdited: baseContext.nodeData?.lockedAndCannotBeEdited
            }
        };
    }, [baseConfig, baseContext.nodeData, baseContext.siteInfo]);

    return (
        <ContentEditorConfigContextProvider config={contextConfig}>
            <SourceContentFormBuilder/>
        </ContentEditorConfigContextProvider>
    );
};

SourceContentPanelInner.propTypes = {
    baseConfig: PropTypes.shape({
        sideBySideContext: PropTypes.shape({
            lang: PropTypes.string
        }),
        lang: PropTypes.string.isRequired,
        i18nContext: PropTypes.object.isRequired,
        setI18nContext: PropTypes.func.isRequired,
        resetI18nContext: PropTypes.func.isRequired
    }).isRequired,
    baseContext: PropTypes.shape({
        nodeData: PropTypes.shape({
            hasWritePermission: PropTypes.bool,
            lockedAndCannotBeEdited: PropTypes.bool,
            translationLanguages: PropTypes.arrayOf(PropTypes.string)
        }),
        siteInfo: PropTypes.shape({
            defaultLanguage: PropTypes.string
        })
    }).isRequired
};
