import * as _ from 'lodash';
import ellipsize from 'ellipsize';
import JContentConstants from './JContent.constants';

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
    let pathBase = '/sites/' + siteKey + (mode === JContentConstants.mode.MEDIA ? '/files' : '');
    let pathParts = path.replace(pathBase, '').split('/');
    let paths = [];
    // eslint-disable-next-line no-unused-vars
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

function removeFileExtension(filename) {
    if (filename.lastIndexOf('.') > 0) {
        return filename.substr(0, filename.lastIndexOf('.'));
    }

    return filename;
}

function getNewCounter(nodes) {
    let max = 0;
    nodes.forEach(node => {
        let name = removeFileExtension(node.name);
        let extracted = name.match(/[0-9]+$/g);
        if (extracted !== null) {
            let counter = parseInt(extracted[0], 10);
            if (counter > max) {
                max = counter;
            }
        }
    });
    return max + 1;
}

function allowDoubleClickNavigation(nodeType, subNodes, fcn) {
    if (['jnt:page', 'jnt:folder', 'jnt:contentFolder'].indexOf(nodeType) !== -1 || (subNodes && subNodes > 0)) {
        return fcn;
    }

    return function () {};
}

function getDefaultLocale(lang) {
    return ['en', 'fr', 'de'].indexOf(lang) > -1 ? lang : 'en';
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
    getDefaultLocale,
    getNewCounter,
    removeFileExtension,
    allowDoubleClickNavigation
};
