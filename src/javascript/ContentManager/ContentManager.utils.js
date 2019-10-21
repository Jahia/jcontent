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

function getZipName(name) {
    if (name.lastIndexOf('.') > 0) {
        return name.substr(0, name.lastIndexOf('.')) + '.zip';
    }

    return name + '.zip';
}

function getNameWithoutExtension(name) {
    if (name.lastIndexOf('.') > 0) {
        return name.substr(0, name.lastIndexOf('.'));
    }

    return name;
}

function getNewCounter(nodes) {
    let max = 0;
    nodes.forEach(node => {
        let counter = node.name.match(/[0-9]+.zip/g);
        if (counter !== null) {
            counter = counter[0].match(/[0-9]+/g);
            if (counter !== null && counter[0] > max) {
                max = counter;
            }
        }
    });
    return parseFloat(max) + 1;
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
    getZipName,
    getNewCounter,
    getNameWithoutExtension,
    allowDoubleClickNavigation
};
