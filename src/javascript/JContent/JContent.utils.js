import React from 'react';
import * as _ from 'lodash';
import ellipsize from 'ellipsize';
import JContentConstants from './JContent.constants';
import {getIcon} from '@jahia/icons';
import {Layers} from '@jahia/moonstone';

export const getNewNodePath = (oldPath, oldAncestorPath, newAncestorPath) => {
    if (_.startsWith(oldPath, oldAncestorPath + '/') || oldPath === oldAncestorPath) {
        let relativePath = oldPath.substring(oldAncestorPath.length, oldPath.length);
        return (newAncestorPath + relativePath);
    }

    return oldPath;
};

export const hasMixin = (node, mixin) => {
    if (node.mixinTypes) {
        return _.find(node.mixinTypes, t => t.name === mixin) !== undefined;
    }

    let mixinTypesProperty = _.find(node.properties, property => property.name === 'jcr:mixinTypes');
    if (mixinTypesProperty) {
        return _.includes(mixinTypesProperty.values, mixin);
    }

    return false;
};

export const hasProperty = (node, propertyName) => {
    let propertyValue = _.find(node.properties, property => property.name === propertyName);
    return propertyValue !== undefined;
};

export const isDescendant = (path, ancestorPath) => {
    return path.startsWith(ancestorPath + '/');
};

export const isDescendantOrSelf = (path, ancestorOrSelfPath) => {
    return (path === ancestorOrSelfPath || isDescendant(path, ancestorOrSelfPath));
};

export const isMarkedForDeletion = node => {
    return hasMixin(node, 'jmix:markedForDeletion');
};

export const isWorkInProgress = (node, lang) => {
    if (node.wipStatus) {
        switch (node.wipStatus.value) {
            case 'ALL_CONTENT':
                return true;
            case 'LANGUAGES':
                return _.includes(node.wipLangs.values, lang);
            default:
                return false;
        }
    }

    return false;
};

export const extractPaths = (siteKey, path, mode) => {
    let pathBase = '/sites/' + siteKey + (mode === JContentConstants.mode.MEDIA ? '/files' : '');
    let pathParts = path.replace(pathBase, '').split('/');
    let paths = [];
    if (path.startsWith(pathBase)) {
        for (let i in pathParts) {
            if (i > 0) {
                paths.push(paths[i - 1] + '/' + pathParts[i]);
            } else {
                paths.push(pathBase);
            }
        }
    }

    return paths;
};

export const ellipsizeText = (text, maxLength) => {
    return ellipsize(text, maxLength || 100, {chars: [' ', '&']});
};

export const removeFileExtension = filename => {
    if (filename.lastIndexOf('.') > 0) {
        return filename.substr(0, filename.lastIndexOf('.'));
    }

    return filename;
};

export const getNewCounter = nodes => {
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
};

export const allowDoubleClickNavigation = (nodeType, subNodes, fcn) => {
    if (['jnt:page', 'jnt:folder', 'jnt:contentFolder'].indexOf(nodeType) !== -1 || (subNodes && subNodes > 0)) {
        return fcn;
    }

    return function () {};
};

export const getDefaultLocale = lang => {
    return ['en', 'fr', 'de'].indexOf(lang) > -1 ? lang : 'en';
};

export const getLanguageLabel = (languages, currentLang) => {
    return _.find(languages, function (language) {
        if (language.language === currentLang) {
            return language;
        }
    }) || {
        language: currentLang,
        displayName: Intl.DisplayNames ? new Intl.DisplayNames([contextJsParameters.language], {type: 'language'}).of(currentLang.split('_')[0]) : currentLang.split('_')[0]
    };
};

export const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.substr(1);
};

export const getNodeTypeIcon = typeName => {
    const Icon = getIcon(typeName) || Layers;
    return <Icon/>;
};

export const isObject = item => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

export const mergeDeep = (target, ...sources) => {
    if (!sources.length) {
        return target;
    }

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, {[key]: {}});
                }

                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
};

export const arrayValue = value => {
    return (typeof value === 'string') ? value.split(',') : value;
};

export const booleanValue = v => typeof v === 'string' ? v === 'true' : Boolean(v);
