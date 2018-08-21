import constants from "./constants.js";
import {SITE_ROOT} from "./CmRouter";

function getAbsoluteBrowsingPath(browsingType, lang, relativePath) {
    let basePath = constants.browsingPathByType[browsingType]
    if (!basePath) {
        basePath = "browse";
    }
    return `${SITE_ROOT}/${lang}/${basePath}${relativePath}`;
}

export {getAbsoluteBrowsingPath};