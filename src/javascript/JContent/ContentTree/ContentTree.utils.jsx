import {getIcon} from '@jahia/icons';
import React from 'react';
import JContentConstants from '../JContent.constants';
import {isMarkedForDeletion} from '../JContent.utils';
import {Lock, NoCloud} from '@jahia/moonstone/dist/icons';
import classNames from 'clsx';
import styles from './ContentTree.scss';

function displayIcon(node) {
    const Icon = getIcon(node.primaryNodeType.name);
    return <Icon/>;
}

function getParentPath(path) {
    return path.substr(0, path.lastIndexOf('/'));
}

function findInTree(tree, id) {
    for (let i = 0; i < tree.length; i++) {
        if (tree[i].id === id) {
            return tree[i];
        }

        let result = findInTree(tree[i].children, id);
        if (result) {
            return result;
        }
    }
}

function convertPathsToTree(pickerEntries, selected) {
    let tree = [];
    if (pickerEntries.length === 0) {
        return tree;
    }

    pickerEntries.forEach(pickerEntry => {
        const notPublished = pickerEntry.node.publicationStatus && (
            pickerEntry.node.publicationStatus.publicationStatus === JContentConstants.availablePublicationStatuses.NOT_PUBLISHED ||
            pickerEntry.node.publicationStatus.publicationStatus === JContentConstants.availablePublicationStatuses.UNPUBLISHED);
        const locked = Boolean(pickerEntry.node.lockOwner);
        const markedForDeletion = isMarkedForDeletion(pickerEntry.node);

        let parentPath = getParentPath(pickerEntry.path);
        let element = {
            id: pickerEntry.path,
            label: pickerEntry.node.displayName,
            hasChildren: pickerEntry.hasChildren,
            parent: parentPath,
            isClosable: pickerEntry.depth > 0,
            iconStart: displayIcon(pickerEntry.node),
            iconEnd: (locked && <Lock/>) || (notPublished && <NoCloud/>),
            typographyOptions: {
                hasLineThrough: markedForDeletion,
                isItalic: notPublished
            },
            className: classNames(styles.ContentTree_Item, {
                [styles.notPublished]: notPublished && selected !== pickerEntry.path
            }),
            children: []
        };
        let parent = findInTree(tree, parentPath);
        if (parent !== undefined && !findInTree(parent, element.id)) {
            parent.children.push(element);
        } else if (!findInTree(tree, element.id)) {
            tree.push(element);
        }
    });

    return tree;
}

export {convertPathsToTree, getParentPath, findInTree};
