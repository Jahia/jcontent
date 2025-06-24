import React from 'react';
import {SiteWeb} from '@jahia/moonstone';
import {NodeIcon} from '~/utils/NodeIcon';
export {mergeDeep} from '~/JContent/JContent.utils';

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
