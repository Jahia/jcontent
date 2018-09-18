const CM_NAVIGATE = 'CM_NAVIGATE';
const CM_SET_UILANGUAGE = 'CM_SET_UILANGUAGE';

function setUiLang(uiLang) {
    return {
        type: CM_SET_UILANGUAGE,
        uiLang
    }
}

function cmGoto(data) {
    return Object.assign(data || {}, {type: CM_NAVIGATE});
}

function cmSetSite(site) {
    return cmGoto({site});
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

export {
    CM_NAVIGATE,
    CM_SET_UILANGUAGE,
    cmGoto,
    cmSetLanguage,
    cmSetUiLang,
    cmSetSite,
    cmSetMode,
    cmSetPath,
    cmSetParams
}