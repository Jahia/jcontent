import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import {useSiteInfo} from '@jahia/data-helper';
import {ContentEditorConfigContextProvider} from '~/ContentEditor/contexts';
import {useEditFormDefinition} from '~/ContentEditor/ContentEditor/useEditFormDefinition';
import {SidePanelContextProvider} from '~/JContent/SidePanel';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {cmCloseSidePanel, cmSetPreviewFullScreen} from '~/JContent/redux/preview.redux';

// Inner component — only rendered when sidePanelSelection is set.
// Calls hooks that require ContentEditorConfigContext.
const JContentSidePanelData = ({sidePanelSelection, selection, language, jcontentMode, isFullScreen, children}) => {
    const dispatch = useDispatch();
    const {data} = useEditFormDefinition();
    const siteKey = useSelector(state => state.site);
    const uiLanguage = useSelector(state => state.uilang);
    const siteInfoResult = useSiteInfo({siteKey, displayLanguage: language, uiLanguage});

    const ctx = {
        // Navigation / selection
        path: sidePanelSelection.path,
        lang: language,
        previewSelection: sidePanelSelection,
        selection,
        mode: jcontentMode,
        isJContent: true,

        // Node data — use rich nodeData from form definition when loaded, fall back to table node
        nodeData: data?.nodeData ?? sidePanelSelection,
        technicalInfo: data?.technicalInfo,
        details: data?.details,
        hasPreview: data?.hasPreview,
        siteInfo: siteInfoResult.siteInfo,

        // Full-screen
        isFullScreen,
        onFullScreenToggle: () => dispatch(cmSetPreviewFullScreen(!isFullScreen)),

        // Close side panel
        onClose: () => dispatch(cmCloseSidePanel()),

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
    sidePanelSelection: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired,
    language: PropTypes.string.isRequired,
    jcontentMode: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
};

// Outer component — handles the no-selection case without calling form-definition hooks.
export const JContentSidePanelContextProvider = ({sidePanelSelection, selection, language, jcontentMode, isFullScreen, children}) => {
    const dispatch = useDispatch();

    if (!sidePanelSelection) {
        return (
            <SidePanelContextProvider value={{
                path: null,
                lang: language,
                previewSelection: null,
                selection,
                mode: jcontentMode,
                isJContent: true,
                isFullScreen,
                onFullScreenToggle: () => dispatch(cmSetPreviewFullScreen(!isFullScreen)),
                onClose: () => dispatch(cmCloseSidePanel())
            }}
            >
                {children}
            </SidePanelContextProvider>
        );
    }

    const ceConfig = {
        uuid: sidePanelSelection.uuid,
        lang: language,
        contentType: sidePanelSelection.primaryNodeType?.name,
        mode: 'edit'
    };

    return (
        <ContentEditorConfigContextProvider config={ceConfig}>
            <JContentSidePanelData
                sidePanelSelection={sidePanelSelection}
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
    sidePanelSelection: PropTypes.object,
    selection: PropTypes.array.isRequired,
    language: PropTypes.string.isRequired,
    jcontentMode: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
};
