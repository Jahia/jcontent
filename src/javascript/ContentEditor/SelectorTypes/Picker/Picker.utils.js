import React from 'react';
import {SiteWeb} from '@jahia/moonstone';
import {NodeIcon} from '~/utils/NodeIcon';

export const getPathWithoutFile = fullPath => {
    return fullPath && fullPath.split('/').slice(0, -1).join('/');
};

export const getRelativePath = fullPath => {
    return getPathWithoutFile(fullPath.replace('/sites/', '')) || '';
};

export const flattenTree = rows => {
    const items = [];
    collectItems(rows);
    return items;

    function collectItems(arrayData) {
        for (let i = 0; i < arrayData.length; i++) {
            items.push(arrayData[i]);
            collectItems(arrayData[i].subRows || []);
        }
    }
};

export const getSite = fullPath => {
    return fullPath && fullPath
        .split('/')
        .slice(0, 3)
        .join('/');
};

export const getDetailedPathArray = fullPath => {
    return fullPath ?
        fullPath
            .split('/')
            .slice(1)
            .reduce((prev, current, currentIndex) => {
                return [
                    ...prev,
                    prev[currentIndex - 1] ? `${prev[currentIndex - 1]}/${current}` : `/${current}`
                ];
            }, [])
            .slice(2) :
        [];
};

export const set = (target, path, value) => {
    const splitRes = path.split('.');
    const regex = /(\[\d+])$/;

    let key;
    let position;
    let match;
    let current = target;
    while ((splitRes.length > 1) && (key = splitRes.shift())) {
        // Case items[0].key = 'something'
        match = regex.exec(key);

        if (match) {
            key = key.replace(match[0], '');
            position = parseInt(match[0].replace(/[[\]]/g, ''), 10);
        }

        if (!current[key]) {
            if (match) {
                current[key] = [];
            } else {
                current[key] = {};
            }
        }

        if (Array.isArray(current[key])) {
            if (!current[key][position]) {
                current[key][position] = {};
            }

            current = current[key][position];
            match = null;
            position = null;
        } else {
            current = current[key];
        }
    }

    key = splitRes.shift();

    // Case items[0] = 'something'
    match = regex.exec(key);

    if (match) {
        key = key.replace(match[0], '');
        position = parseInt(match[0].replace(/[[\]]/g, ''), 10);

        if (!current[key]) {
            current[key] = [];
        }

        current[key][position] = value;
    } else {
        current[key] = value;
    }
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

export const getBaseSearchContextData = ({t, currentSite, accordion, node, currentPath}) => (
    [
        {
            label: t('jcontent:label.contentEditor.picker.rightPanel.searchContextOptions.search'),
            searchPath: '',
            isDisabled: true
        },
        {
            label: currentSite.substring(0, 1).toUpperCase() + currentSite.substring(1),
            searchPath: `/sites/${currentSite}`,
            iconStart: <SiteWeb/>
        },
        {
            label: t(accordion.label),
            searchPath: accordion.getRootPath(currentSite),
            iconStart: accordion.icon
        },
        {
            label: node?.displayName,
            searchPath: currentPath,
            iconStart: node && <NodeIcon node={node}/>
        }
    ]
        .filter((currentItem, index, array) => array.findIndex(item => item.searchPath === currentItem.searchPath) === index)
        .filter(value => currentPath.startsWith(value.searchPath))
);

export const arrayValue = value => {
    return (typeof value === 'string') ? value.split(',') : value;
};

export const booleanValue = v => typeof v === 'string' ? v === 'true' : Boolean(v);

export const toArray = value => (Array.isArray(value) ? value : [value]);

export const getCanDisplayItemParams = node => {
    const folders = ['jnt:contentFolder', 'jnt:folder'];
    const params = {};

    if (folders.includes(node.primaryNodeType.name)) {
        params.folderNode = node;
    } else {
        params.selectionNode = node;
    }

    return params;
};
