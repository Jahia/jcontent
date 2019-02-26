const CM_NAVIGATE = 'CM_NAVIGATE';
const CM_SET_UILANGUAGE = 'CM_SET_UILANGUAGE';
const CM_SET_TREE = 'CM_SET_TREE';
const CM_SET_OPEN_PATHS = 'CM_SET_OPEN_PATHS';
const CM_SET_SEARCH_MODE = 'CM_SET_SEARCH_MODE';
const CM_ADD_PATHS_TO_REFETCH = 'CM_ADD_PATHS_TO_REFETCH';
const CM_REMOVE_PATHS_TO_REFETCH = 'CM_REMOVE_PATHS_TO_REFETCH';
const CM_SET_AVAILABLE_LANGUAGES = 'CM_SET_AVAILABLE_LANGUAGES';
const CM_SET_SITE_DISPLAYABLE_NAME = 'CM_SET_SITE_DISPLAYABLE_NAME';

const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};
const CM_PREVIEW_MODES = {EDIT: 'edit', LIVE: 'live'};

function setUiLang(uiLang) {
    return {
        type: CM_SET_UILANGUAGE,
        uiLang
    };
}

function cmAddPathsToRefetch(paths) {
    return {
        type: CM_ADD_PATHS_TO_REFETCH,
        paths: paths
    };
}

function cmRemovePathsToRefetch(paths) {
    return {
        type: CM_REMOVE_PATHS_TO_REFETCH,
        paths: paths
    };
}

function cmOpenPaths(paths) {
    return {
        type: CM_SET_OPEN_PATHS,
        open: paths
    };
}

function cmClosePaths(paths) {
    return {
        type: CM_SET_OPEN_PATHS,
        close: paths
    };
}

function cmGoto(data) {
    return Object.assign(data || {}, {type: CM_NAVIGATE});
}

function cmSetSite(site, language, siteDisplayableName) {
    return cmGoto({site, language, siteDisplayableName});
}

function cmSetLanguage(language) {
    return cmGoto({language});
}

function cmSetAvailableLanguages(availableLanguages) {
    return {
        type: CM_SET_AVAILABLE_LANGUAGES,
        availableLanguages: availableLanguages
    };
}

function cmSetSiteDisplayableName(siteDisplayableName) {
    return {
        type: CM_SET_SITE_DISPLAYABLE_NAME,
        siteDisplayableName: siteDisplayableName
    };
}

function cmSetMode(mode) {
    return cmGoto({mode});
}

function cmSetPath(path) {
    return cmGoto({path});
}

function cmSetParams(params) {
    return cmGoto({params});
}

function cmSetTreeState(state) {
    return {
        type: CM_SET_TREE,
        treeState: state
    };
}

function cmSetSearchMode(searchMode) {
    return {
        type: CM_SET_SEARCH_MODE,
        searchMode: searchMode
    };
}

export {
    CM_NAVIGATE,
    CM_SET_UILANGUAGE,
    CM_SET_TREE,
    CM_SET_OPEN_PATHS,
    CM_SET_SEARCH_MODE,
    CM_DRAWER_STATES,
    CM_PREVIEW_MODES,
    CM_ADD_PATHS_TO_REFETCH,
    CM_REMOVE_PATHS_TO_REFETCH,
    CM_SET_AVAILABLE_LANGUAGES,
    CM_SET_SITE_DISPLAYABLE_NAME,
    cmGoto,
    cmSetLanguage,
    cmSetAvailableLanguages,
    cmSetSiteDisplayableName,
    setUiLang,
    cmSetSite,
    cmSetMode,
    cmSetPath,
    cmSetParams,
    cmOpenPaths,
    cmClosePaths,
    cmSetTreeState,
    cmSetSearchMode,
    cmAddPathsToRefetch,
    cmRemovePathsToRefetch
};
