import React, {useMemo} from 'react';
import * as PropTypes from 'prop-types';
import {ContentEditorConfigContextProvider, useContentEditorConfigContext} from './ContentEditorConfig.context';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

/**
 * Renders its children as a read-only "side-by-side source" column, next to the live edit form — the
 * setup the Translate tab uses to show a source language, and the supported seam for modules that want
 * the same thing (e.g. content-versioning restoring a value from a past version). See issue #2579.
 *
 * It reads the surrounding config and node contexts, builds the `sideBySideContext` (so consumers no
 * longer hand-craft it), and provides an overridden config down the tree. Per-field restore arrows
 * (`translateFieldAction`) light up for i18n fields, copying the source value into the live form's
 * `translateLang`.
 *
 * @param translateLang the editable language a restored value is copied into; defaults to the current config language
 * @param sourceLang    the language this source column renders in; defaults to the existing side-by-side language, then the config language
 */
export const SideBySideSourceProvider = ({translateLang, sourceLang, children}) => {
    const baseConfig = useContentEditorConfigContext();
    const {nodeData} = useContentEditorContext();

    const hasWritePermission = nodeData?.hasWritePermission;
    const lockedAndCannotBeEdited = nodeData?.lockedAndCannotBeEdited;

    const config = useMemo(() => ({
        ...baseConfig,
        lang: sourceLang ?? baseConfig.sideBySideContext?.lang ?? baseConfig.lang,
        sideBySideContext: {
            ...baseConfig.sideBySideContext,
            enabled: true,
            readOnly: true,
            translateLang: translateLang ?? baseConfig.lang,
            // Permissions come from the editable node, not this read-only source column.
            hasWritePermission,
            lockedAndCannotBeEdited
        }
    }), [baseConfig, sourceLang, translateLang, hasWritePermission, lockedAndCannotBeEdited]);

    return (
        <ContentEditorConfigContextProvider config={config}>
            {children}
        </ContentEditorConfigContextProvider>
    );
};

SideBySideSourceProvider.propTypes = {
    translateLang: PropTypes.string,
    sourceLang: PropTypes.string,
    children: PropTypes.node.isRequired
};
