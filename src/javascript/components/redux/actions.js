const CM_NAVIGATE = 'CM_NAVIGATE';
const CM_SET_UILANGUAGE = 'CM_SET_UILANGUAGE';
const CM_SET_SELECTION = 'CM_SET_SELECTION';
const CM_SET_PREVIEW = 'CM_SET_PREVIEW';
const CM_SET_OPEN_PATHS = 'CM_SET_OPEN_PATHS';
const CM_SET_SEARCH_MODE = 'CM_SET_SEARCH_MODE';

const CM_PREVIEW_STATES = {"HIDE": 0, "SHOW": 1};

function setUiLang(uiLang) {
    return {
        type: CM_SET_UILANGUAGE,
        uiLang
    }
}

function cmSetSelection(selection) {
    return {
        type: CM_SET_SELECTION,
        selection
    }
}

function cmOpenPaths(paths) {
    return {
        type: CM_SET_OPEN_PATHS,
        open: paths
    }
}

function cmClosePaths(paths) {
    return {
        type: CM_SET_OPEN_PATHS,
        close: paths
    }
}

function cmGoto(data) {
    return Object.assign(data || {}, {type: CM_NAVIGATE});
}

function cmSetSite(site, language) {
    return cmGoto({site, language});
}

function cmSetLanguage(language) {
    return cmGoto({language});
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
        type: CM_SET_PREVIEW,
        previewMode: mode
    }
}

function cmSetPreviewModes(modes) {
    return {
        type: CM_SET_PREVIEW,
        previewModes: modes
    }
}

function cmSetPreviewState(state) {
    return {
        type: CM_SET_PREVIEW,
        previewState: state
    }
}

function cmSetSearchMode(searchMode) {
    return {
        type: CM_SET_SEARCH_MODE,
        searchMode: searchMode
    }
}

export {
    CM_NAVIGATE,
    CM_SET_UILANGUAGE,
    CM_SET_SELECTION,
    CM_SET_PREVIEW,
    CM_SET_OPEN_PATHS,
    CM_PREVIEW_STATES,
    CM_SET_SEARCH_MODE,
    cmGoto,
    cmSetLanguage,
    setUiLang,
    cmSetSelection,
    cmSetSite,
    cmSetMode,
    cmSetPath,
    cmSetParams,
    cmSetPreviewMode,
    cmSetPreviewModes,
    cmOpenPaths,
    cmClosePaths,
    cmSetPreviewState,
    cmSetSearchMode,
};