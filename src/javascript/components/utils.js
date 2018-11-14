import * as _ from "lodash";
import ellipsize from "ellipsize";

function hasMixin(node, mixin) {
    let mixinTypesProperty = _.find(node.properties, property => property.name === 'jcr:mixinTypes');
    return (mixinTypesProperty != null && _.includes(mixinTypesProperty.values, mixin));
}

function hasProperty(node, propertyName){
    let propertyValue = _.find(node.properties, property => property.name === propertyName);
    return propertyValue !== undefined;
}

function isDescendant(path, ancestorPath) {
    return path.startsWith(ancestorPath + "/");
}

function isDescendantOrSelf(path, ancestorOrSelfPath) {
    return (path === ancestorOrSelfPath || isDescendant(path, ancestorOrSelfPath));
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

function ellipsizeText(text, maxLength) {
    return ellipsize(text, maxLength || 100, { chars: [' ', '&']});
}

function allowDoubleClickNavigation(nodeType, fcn) {
    if (["jnt:page", "jnt:folder", "jnt:contentFolder"].indexOf(nodeType) !== -1) {
        return fcn;
    }
    return function(){};
}

export {
    hasMixin,
    isDescendant,
    isDescendantOrSelf,
    extractPaths,
    ellipsizeText,
    hasProperty,
    allowDoubleClickNavigation
};