import React from 'react';
import {SiteWeb} from '@jahia/moonstone';
import {NodeIcon} from '~/utils/NodeIcon';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
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

// The flag that the selection query sets on the ancestors that open in each view
const openableFlags = {
    [Constants.tableView.type.PAGES]: 'isOpenableInPages',
    [Constants.tableView.type.CONTENT]: 'isOpenableInContent'
};

// The ancestors to open so that the tree shows the node: in a view the query flagged, only those the tree shows as rows
export const getAncestorPathsToOpen = (node, flaggedViewType) => {
    const flag = openableFlags[flaggedViewType];
    return flag ?
        node.ancestors.filter(ancestor => ancestor[flag]).map(ancestor => ancestor.path) :
        getDetailedPathArray(getPathWithoutFile(node.path));
};

// The server refuses the part of a query that reads more nodes than its limit allows
export const isOverNodeLimit = error => Boolean(error?.graphQLErrors?.some(e => e.extensions?.classification === 'ExecutionAborted' || e.errorType === 'ExecutionAborted'));

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
