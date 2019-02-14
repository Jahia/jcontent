import * as _ from 'lodash';
import ellipsize from 'ellipsize';

function getNewNodePath(oldPath, oldAncestorPath, newAncestorPath) {
    if (_.startsWith(oldPath, oldAncestorPath + '/') || oldPath === oldAncestorPath) {
        let relativePath = oldPath.substring(oldAncestorPath.length, oldPath.length);
        return (newAncestorPath + relativePath);
    }
    return oldPath;
}

function hasMixin(node, mixin) {
    if (node.mixinTypes) {
        return _.find(node.mixinTypes, t => t.name === mixin) !== undefined;
    }
    let mixinTypesProperty = _.find(node.properties, property => property.name === 'jcr:mixinTypes');
    if (mixinTypesProperty) {
        return _.includes(mixinTypesProperty.values, mixin);
    }
    return false;
}

function hasProperty(node, propertyName) {
    let propertyValue = _.find(node.properties, property => property.name === propertyName);
    return propertyValue !== undefined;
}

function isDescendant(path, ancestorPath) {
    return path.startsWith(ancestorPath + '/');
}

function isDescendantOrSelf(path, ancestorOrSelfPath) {
    return (path === ancestorOrSelfPath || isDescendant(path, ancestorOrSelfPath));
}

function isMarkedForDeletion(node) {
    return hasMixin(node, 'jmix:markedForDeletion');
}

function extractPaths(siteKey, path, mode) {
    let pathBase = '/sites/' + siteKey + (mode === 'browse-files' ? '/files' : '');
    let pathParts = path.replace(pathBase, '').split('/');
    let paths = [];
    for (let i in pathParts) {
        if (i > 0) {
            paths.push(paths[i - 1] + '/' + pathParts[i]);
        } else {
            paths.push(pathBase);
        }
    }
    return paths;
}

function ellipsizeText(text, maxLength) {
    return ellipsize(text, maxLength || 100, {chars: [' ', '&']});
}

function allowDoubleClickNavigation(nodeType, subNodes, fcn) {
    if (['jnt:page', 'jnt:folder', 'jnt:contentFolder'].indexOf(nodeType) !== -1 || (subNodes && subNodes > 0)) {
        return fcn;
    }
    return function () {};
}

export {
    getNewNodePath,
    hasMixin,
    isDescendant,
    isDescendantOrSelf,
    isMarkedForDeletion,
    extractPaths,
    ellipsizeText,
    hasProperty,
    allowDoubleClickNavigation
};
