import {getIcon} from '@jahia/icons';
import React from 'react';
import JContentConstants from '../JContent.constants';
import {isMarkedForDeletion} from '../JContent.utils';
import {StatusIcon} from './StatusIcon';
import classNames from 'clsx';
import styles from './ContentTree.scss';
import {DefaultEntry, Section} from '@jahia/moonstone';

export function displayIcon(node) {
    if (node.primaryNodeType.name === 'jnt:navMenuText') {
        return <Section/>;
    }

    const Icon = getIcon(node.primaryNodeType.name);
    return (Icon && <Icon/>) || <DefaultEntry/>;
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

function convertPathsToTree({treeEntries, selected, isReversed, contentMenu, itemProps}) {
    let tree = [];
    if (treeEntries.length === 0) {
        return tree;
    }

    treeEntries.forEach(treeEntry => {
        const notPublished = treeEntry.node.publicationStatus && (
            treeEntry.node.publicationStatus.publicationStatus === JContentConstants.availablePublicationStatuses.NOT_PUBLISHED ||
            treeEntry.node.publicationStatus.publicationStatus === JContentConstants.availablePublicationStatuses.UNPUBLISHED);
        const locked = Boolean(treeEntry.node.lockOwner);
        const markedForDeletion = isMarkedForDeletion(treeEntry.node);

        const parentPath = getParentPath(treeEntry.path);

        const element = {
            id: treeEntry.path,
            label: treeEntry.node.displayName,
            hasChildren: treeEntry.hasChildren,
            parent: parentPath,
            isClosable: treeEntry.depth > 0,
            iconStart: displayIcon(treeEntry.node),
            iconEnd: <StatusIcon path={treeEntry.path} contentMenu={contentMenu} isLocked={locked} isNotPublished={notPublished}/>,
            typographyOptions: {
                hasLineThrough: markedForDeletion,
                isItalic: notPublished
            },
            className: classNames(styles.ContentTree_Item, {
                [styles.notPublished]: !isReversed && notPublished && selected !== treeEntry.path,
                [styles.notPublishedReversed]: isReversed && notPublished && selected !== treeEntry.path
            }),
            children: [],
            treeItemProps: {
                'data-sel-role': treeEntry.node.name,
                node: treeEntry.node,
                ...itemProps
            }
        };
        const parent = findInTree(tree, parentPath);
        if (parent !== undefined && !findInTree(parent, element.id)) {
            parent.children.push(element);
        } else if (!findInTree(tree, element.id)) {
            tree.push(element);
        }
    });

    return tree;
}

export {convertPathsToTree, getParentPath, findInTree};
