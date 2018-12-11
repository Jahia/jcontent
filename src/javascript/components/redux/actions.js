const CM_NAVIGATE = 'CM_NAVIGATE';
const CM_SET_UILANGUAGE = 'CM_SET_UILANGUAGE';
const CM_SET_SELECTION = 'CM_SET_SELECTION';
const CM_SET_PREVIEW_MODE = 'CM_SET_PREVIEW_MODE';
const CM_SET_PREVIEW = 'CM_SET_PREVIEW';
const CM_SET_TREE = 'CM_SET_TREE';
const CM_SET_PAGE = 'CM_SET_PAGE';
const CM_SET_PAGE_SIZE = 'CM_SET_PAGE_SIZE';
const CM_SET_SORT = 'CM_SET_SORT';
const CM_SET_SORT_BY = 'CM_SET_SORT_BY';
const CM_SET_OPEN_PATHS = 'CM_SET_OPEN_PATHS';
const CM_SET_SEARCH_MODE = 'CM_SET_SEARCH_MODE';
const CM_ADD_PATHS_TO_REFETCH = 'CM_ADD_PATHS_TO_REFETCH';
const CM_REMOVE_PATHS_TO_REFETCH = 'CM_REMOVE_PATHS_TO_REFETCH';
const CM_SET_AVAILABLE_LANGUAGES = 'CM_SET_AVAILABLE_LANGUAGES';

const CM_DRAWER_STATES = {HIDE: 0, TEMP: 1, SHOW: 2, FULL_SCREEN: 3};

function setUiLang(uiLang) {
    return {
        type: CM_SET_UILANGUAGE,
        uiLang
    };
}

function cmSetSelection(selection) {
    return {
        type: CM_SET_SELECTION,
        selection
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

function cmSetMode(mode) {
    return cmGoto({mode});
}

function cmSetPath(path) {
    return cmGoto({path});
}

function cmSetParams(params) {
    return cmGoto({params});
}

function cmSetPreviewMode(mode) {
    return {
        type: CM_SET_PREVIEW_MODE,
        previewMode: mode
    };
}

function cmSetPreviewState(state) {
    return {
        type: CM_SET_PREVIEW,
        previewState: state
    };
}

function cmSetTreeState(state) {
    return {
        type: CM_SET_TREE,
        treeState: state
    };
}

function cmSetPage(page) {
    return {
        type: CM_SET_PAGE,
        page: page
    };
}

function cmSetPageSize(size) {
    return {
        type: CM_SET_PAGE_SIZE,
        pageSize: size
    };
}

function cmSetSort(sort) {
    return {
        type: CM_SET_SORT,
        sort: sort
    };
}

function cmSetSortBy(sortBy) {
    return {
        type: CM_SET_SORT_BY,
        sortBy: sortBy
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
    CM_SET_SELECTION,
    CM_SET_PREVIEW,
    CM_SET_PREVIEW_MODE,
    CM_SET_TREE,
    CM_SET_OPEN_PATHS,
    CM_SET_SEARCH_MODE,
    CM_SET_SORT,
    CM_SET_SORT_BY,
    CM_SET_PAGE,
    CM_SET_PAGE_SIZE,
    CM_DRAWER_STATES,
    CM_ADD_PATHS_TO_REFETCH,
    CM_REMOVE_PATHS_TO_REFETCH,
    CM_SET_AVAILABLE_LANGUAGES,
    cmGoto,
    cmSetLanguage,
    cmSetAvailableLanguages,
    setUiLang,
    cmSetSelection,
    cmSetSite,
    cmSetMode,
    cmSetPath,
    cmSetParams,
    cmSetSort,
    cmSetSortBy,
    cmSetPage,
    cmSetPageSize,
    cmSetPreviewMode,
    cmOpenPaths,
    cmClosePaths,
    cmSetPreviewState,
    cmSetTreeState,
    cmSetSearchMode,
    cmAddPathsToRefetch,
    cmRemovePathsToRefetch
};
