import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';
import {ContentEditorConfigContextProvider} from '~/ContentEditor/contexts';
import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {SidePanelContextProvider} from '~/ContentEditor/editorTabs/EditPanelContent/SidePanel';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {cmSetPreviewFullScreen} from '~/JContent/redux/preview.redux';
import {useDispatch} from 'react-redux';

// Inner component — only rendered when previewSelection is set.
// Calls hooks that require ContentEditorConfigContext.
const JContentSidePanelData = ({previewSelection, selection, language, jcontentMode, isFullScreen, children}) => {
    const dispatch = useDispatch();
    const {data} = useEditFormDefinition();
    const siteKey = useSelector(state => state.site);
    const uiLanguage = useSelector(state => state.uilang);
    const siteInfoResult = useSiteInfo({siteKey, displayLanguage: language, uiLanguage});

    const ctx = {
        // Navigation / selection
        path: previewSelection.path,
        lang: language,
        previewSelection,
        selection,
        mode: jcontentMode,
        isJContent: true,

        // Node data — use rich nodeData from form definition when loaded, fall back to table node
        nodeData: data?.nodeData ?? previewSelection,
        technicalInfo: data?.technicalInfo,
        details: data?.details,
        hasPreview: data?.hasPreview,
        siteInfo: siteInfoResult.siteInfo,

        // Full-screen
        isFullScreen,
        onFullScreenToggle: () => dispatch(cmSetPreviewFullScreen(!isFullScreen)),

        // Refetch bus wired to JContent's registry
        onRefetchReady: refetch => setRefetcher(refetchTypes.PREVIEW_COMPONENT, {refetch}),
        onRefetchInvalidated: () => unsetRefetcher(refetchTypes.PREVIEW_COMPONENT)
    };

    return (
        <SidePanelContextProvider value={ctx}>
            {children}
        </SidePanelContextProvider>
    );
};

JContentSidePanelData.propTypes = {
    previewSelection: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired,
    language: PropTypes.string.isRequired,
    jcontentMode: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
};

// Outer component — handles the no-selection case without calling form-definition hooks.
export const JContentSidePanelContextProvider = ({previewSelection, selection, language, jcontentMode, isFullScreen, children}) => {
    const dispatch = useDispatch();

    if (!previewSelection) {
        return (
            <SidePanelContextProvider value={{
                path: null,
                lang: language,
                previewSelection: null,
                selection,
                mode: jcontentMode,
                isJContent: true,
                isFullScreen,
                onFullScreenToggle: () => dispatch(cmSetPreviewFullScreen(!isFullScreen))
            }}
            >
                {children}
            </SidePanelContextProvider>
        );
    }

    const ceConfig = {
        uuid: previewSelection.uuid,
        lang: language,
        contentType: previewSelection.primaryNodeType?.name,
        mode: 'edit'
    };

    return (
        <ContentEditorConfigContextProvider config={ceConfig}>
            <JContentSidePanelData
                previewSelection={previewSelection}
                selection={selection}
                language={language}
                jcontentMode={jcontentMode}
                isFullScreen={isFullScreen}
            >
                {children}
            </JContentSidePanelData>
        </ContentEditorConfigContextProvider>
    );
};

JContentSidePanelContextProvider.propTypes = {
    previewSelection: PropTypes.object,
    selection: PropTypes.array.isRequired,
    language: PropTypes.string.isRequired,
    jcontentMode: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
};
