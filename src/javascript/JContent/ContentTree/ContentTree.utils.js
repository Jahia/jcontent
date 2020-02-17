import {registry} from '@jahia/ui-extender';
import {File} from '@jahia/moonstone/dist/icons';
import React from 'react';

function getIcon(mode) {
    let registryItem = registry.find({type: 'accordionItem', target: 'jcontent', key: mode});
    const Icon = registryItem[0] ? registryItem[0].icon : <File/>;
    return <Icon.type {...Icon.props} size="small"/>;
}

function getParentPath(path) {
    return path.substr(0, path.lastIndexOf('/'));
}

function findInTree(tree, id) {
    for (var i = 0; i < tree.length; i++) {
        if (tree[i].id === id) {
            return tree[i];
        }

        let result = findInTree(tree[i].children, id);
        if (result) {
            return result;
        }
    }
}

function convertPathsToTree(pickerEntries, mode) {
    let tree = [];
    if (pickerEntries.length === 0) {
        return tree;
    }

    for (let i = 1; i < pickerEntries.length; i++) {
        let parentPath = getParentPath(pickerEntries[i].path);
        let element = {
            id: pickerEntries[i].path,
            label: pickerEntries[i].node.displayName,
            hasChildren: pickerEntries[i].hasChildren,
            parent: parentPath,
            iconStart: getIcon(mode),
            children: []
        };
        let parent = findInTree(tree, parentPath);
        if (parent !== undefined && !findInTree(parent, element.id)) {
            parent.children.push(element);
        } else if (!findInTree(tree, element.id)) {
            tree.push(element);
        }
    }

    return tree;
}

export {convertPathsToTree};
