import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';
import {SidePanel, SidePanelContextProvider} from '~/JContent/SidePanel';
import {ContentEditorConfigContextProvider} from '~/ContentEditor/contexts';
import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {ContentSidePanelProviders} from './ContentSidePanelProviders';
import {ContentSidePanelNodeQuery} from './ContentSidePanel.gql-queries';
import {ensureSidePanelTabsRegistered, getJContentMode, resolveInitialTab} from './ContentSidePanel.utils';

/**
 * Fallback rendering: the panel is still shown, and each tab falls back to its own
 * "nothing to show" state, rather than replacing the whole panel with an error.
 */
const EmptyContentSidePanel = ({language, initialTab}) => (
    <SidePanelContextProvider value={{path: null, lang: language, selection: [], isJContent: true}}>
        <SidePanel initialTab={initialTab}/>
    </SidePanelContextProvider>
);

EmptyContentSidePanel.propTypes = {
    language: PropTypes.string.isRequired,
    initialTab: PropTypes.string
};

/**
 * Innermost level: the node's form definition is loaded, so the full side panel
 * context can be fabricated — the same shape `JContentSidePanelContextProvider`
 * builds from the jContent routes, minus the route-bound entries (see the module
 * documentation for the list).
 */
const ContentSidePanelContent = ({formData, language, workspace, initialTab}) => {
    const uiLanguage = useSelector(state => state.uilang);
    const {nodeData, technicalInfo, details, hasPreview} = formData;
    const {siteInfo} = useSiteInfo({
        siteKey: nodeData.site?.name,
        displayLanguage: language,
        uiLanguage
    });

    const ctx = useMemo(() => ({
        // Navigation / selection — a standalone panel always targets a single node
        path: nodeData.path,
        lang: language,
        previewSelection: nodeData,
        selection: [],
        mode: getJContentMode(nodeData),
        isJContent: true,

        // Node data
        nodeData,
        technicalInfo,
        details,
        hasPreview,
        siteInfo,

        // Preview rendering workspace ('edit' = staging, 'live' = published)
        workspace,

        // No full-screen and no close button outside of jContent's own layout:
        // omitting the callbacks hides both controls.
        isFullScreen: false
    }), [nodeData, language, technicalInfo, details, hasPreview, siteInfo, workspace]);

    return (
        <SidePanelContextProvider value={ctx}>
            <SidePanel initialTab={initialTab}/>
        </SidePanelContextProvider>
    );
};

ContentSidePanelContent.propTypes = {
    formData: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
    workspace: PropTypes.string.isRequired,
    initialTab: PropTypes.string
};

/**
 * Loads the form definition (node data, details, technical info, preview capability)
 * for the resolved uuid. Requires ContentEditorConfigContext, hence the split.
 */
const ContentSidePanelData = ({language, workspace, initialTab}) => {
    const {data, loading, error} = useEditFormDefinition();

    if (loading) {
        return <LoaderOverlay/>;
    }

    if (error || !data) {
        console.warn('[ContentSidePanel] could not load the node definition', error);
        return <EmptyContentSidePanel language={language} initialTab={initialTab}/>;
    }

    return (
        <ContentSidePanelContent
            formData={data}
            language={language}
            workspace={workspace}
            initialTab={initialTab}
        />
    );
};

ContentSidePanelData.propTypes = {
    language: PropTypes.string.isRequired,
    workspace: PropTypes.string.isRequired,
    initialTab: PropTypes.string
};

/** Resolves a path to a uuid — the data hooks below are all uuid-based. */
const ContentSidePanelResolver = ({path, uuid, language, workspace, initialTab}) => {
    const {data, loading} = useQuery(ContentSidePanelNodeQuery, {
        variables: {path},
        skip: !path || Boolean(uuid)
    });

    const resolvedUuid = uuid || data?.jcr?.nodeByPath?.uuid;

    if (loading) {
        return <LoaderOverlay/>;
    }

    if (!resolvedUuid) {
        console.warn('[ContentSidePanel] no node found for', {path, uuid});
        return <EmptyContentSidePanel language={language} initialTab={initialTab}/>;
    }

    return (
        <ContentEditorConfigContextProvider config={{uuid: resolvedUuid, lang: language, mode: 'edit'}}>
            <ContentSidePanelData
                language={language}
                workspace={workspace}
                initialTab={initialTab}
            />
        </ContentEditorConfigContextProvider>
    );
};

ContentSidePanelResolver.propTypes = {
    path: PropTypes.string,
    uuid: PropTypes.string,
    language: PropTypes.string.isRequired,
    workspace: PropTypes.string.isRequired,
    initialTab: PropTypes.string
};

/**
 * Self-contained content side panel (preview / details / usages / history) for a single
 * node, exposed as the `./ContentSidePanel` module-federation entry of jContent.
 *
 * The component fabricates everything the tabs read — the SidePanelContext, the Content
 * Editor config context, and (only when the host page lacks them) an Apollo client, a
 * redux store and a notification provider. The host only has to give it a sized box:
 * the panel fills 100% of its parent.
 *
 * @param {object}  props
 * @param {string}  [props.path]       JCR path of the node. Ignored when `uuid` is set.
 * @param {string}  [props.uuid]       JCR uuid of the node. Takes precedence over `path`.
 * @param {string}  props.language     Content language (e.g. 'en').
 * @param {string}  [props.workspace]  Preview rendering workspace, 'edit' (default) or 'live'.
 *                                     Details / usages / history always read the edit workspace.
 * @param {string}  [props.initialTab] Tab to open first: 'preview' | 'details' | 'usages' |
 *                                     'history', or a raw registry key. Falls back to the
 *                                     first visible tab when the requested one is not displayable.
 */
export const ContentSidePanel = ({path, uuid, language, workspace = 'edit', initialTab}) => {
    // Registers the tabs when jContent's own bootstrap has not run (idempotent).
    // Done during render so the registry is populated before <SidePanel/> reads it.
    useMemo(() => ensureSidePanelTabsRegistered(), []);

    return (
        <ContentSidePanelProviders language={language}>
            <ContentSidePanelResolver
                path={path}
                uuid={uuid}
                language={language}
                workspace={workspace}
                initialTab={resolveInitialTab(initialTab)}
            />
        </ContentSidePanelProviders>
    );
};

ContentSidePanel.propTypes = {
    path: PropTypes.string,
    uuid: PropTypes.string,
    language: PropTypes.string.isRequired,
    workspace: PropTypes.oneOf(['edit', 'live']),
    initialTab: PropTypes.string
};

export default ContentSidePanel;
