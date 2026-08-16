import {registry} from '@jahia/ui-extender';
import {registerSidePanelTabs} from '~/JContent/SidePanel/registerSidePanelTabs';

/** Registry target the side panel tabs are registered into. */
export const SIDE_PANEL_TABS_TARGET = 'sidePanelTabsActions';

/**
 * Friendly aliases for the `initialTab` prop. Raw registry keys are accepted too,
 * so a caller can target a tab added by another module.
 */
export const TAB_ALIASES = {
    preview: 'jcontentSidePanelPreviewTab',
    details: 'ceSidePanelDetailsTab',
    history: 'ceSidePanelHistoryTab',
    usages: 'ceSidePanelUsagesTab'
};

export const resolveInitialTab = initialTab => {
    if (!initialTab) {
        return null;
    }

    return TAB_ALIASES[initialTab] || initialTab;
};

/**
 * The tabs are normally registered by jContent's own `./init` bootstrap. A foreign
 * consumer may load `./ContentSidePanel` before (or without) that bootstrap, so
 * register them on demand. `registerSidePanelTabs` uses `addOrReplace`, which keeps
 * this idempotent whichever side runs first.
 */
export const ensureSidePanelTabsRegistered = () => {
    if (registry.find({target: SIDE_PANEL_TABS_TARGET}).length === 0) {
        registerSidePanelTabs(registry);
    }
};

/**
 * JContent drives a few behaviours off the accordion mode it is currently in
 * (in-context page preview, empty-list placeholder). A foreign consumer has no
 * accordion, so derive the closest equivalent from the node itself.
 */
export const getJContentMode = nodeData => {
    if (nodeData?.isPage || nodeData?.pageAncestors?.length > 0) {
        return 'pages';
    }

    if (nodeData?.isFile) {
        return 'media';
    }

    return 'content-folders';
};
