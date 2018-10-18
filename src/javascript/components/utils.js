import * as _ from "lodash";
import Constants from "./constants";
import {triggerRefetch} from "./refetches.js";

function hasMixin(node, mixin) {
    let mixinTypesProperty = _.find(node.properties, property => property.name === 'jcr:mixinTypes');
    return (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, mixin));
}

function extractPaths(siteKey, path, mode) {
    let pathBase = "/sites/" + siteKey + (mode === 'browse-files' ? '/files' : '');
    let pathParts = path.replace(pathBase, "").split("/");
    let paths = [];
    for (let i in pathParts) {
        if (i > 0) {
            paths.push(paths[i - 1] + "/" + pathParts[i]);
        } else {
            paths.push(pathBase);
        }
    }
    return paths;
}

function refetchContentTreeData() {
    _.forOwn(Constants.contentTreeConfigs, function(cfg) {
        triggerRefetch(cfg.key);
    });
}

function abbreviateIfNeeded(text, maxLength, t) {
    if (!text) {
        return null;
    }
    if (text.length <= maxLength) {
        return text;
    }
    return t("label.ellipsis", {text: text.substring(0, maxLength)});
}

export {
    hasMixin,
    extractPaths,
    refetchContentTreeData,
    abbreviateIfNeeded
};