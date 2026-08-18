import {getIcon} from '@jahia/icons';
import React from 'react';
import JContentConstants from '../JContent.constants';
import {isMarkedForDeletion} from '../JContent.utils';
import {StatusIcon} from './StatusIcon';
import classNames from 'clsx';
import styles from './ContentTree.scss';
import {DefaultEntry, Link, Section, Tag} from '@jahia/moonstone';
import {stripAccents} from './ContentTreeSearch.utils';

export function displayIcon(node) {
    if (node.primaryNodeType.name === 'jnt:navMenuText') {
        return <Section/>;
    }

    if (node.primaryNodeType.name === 'jnt:category') {
        return <Tag/>;
    }

    if (['jnt:nodeLink', 'jnt:externalLink'].includes(node.primaryNodeType.name)) {
        return <Link/>;
    }

    const Icon = getIcon(node.primaryNodeType.name);
    return (Icon && <Icon/>) || <DefaultEntry/>;
}

function getParentPath(path) {
    return path.substr(0, path.lastIndexOf('/'));
}

/**
 * Paths from the given path's parent up to (and including) rootPath, so they can be added to the
 * tree's openPaths and the ancestor branches get fetched/expanded by useTreeEntries.
 * @param {string} path the descendant path to walk up from
 * @param {string} rootPath the tree's root path, walking stops once reached
 * @returns {string[]} ancestor paths, nearest parent first
 */
function getAncestorPaths(path, rootPath) {
    const ancestors = [];
    let current = getParentPath(path);
    while (current && current.length >= rootPath.length) {
        ancestors.push(current);
        if (current === rootPath) {
            break;
        }

        current = getParentPath(current);
    }

    return ancestors;
}

/**
 * Wraps the first case-insensitive occurrence of `term` within `label` in a highlight span, so only
 * the matched word is underlined rather than the whole tree row.
 * @param {string} label the node's display name
 * @param {string} term the active search term
 * @returns {string|JSX.Element} the original label, or a fragment with the match wrapped, when found
 */
function highlightSearchMatch(label, term) {
    if (!term) {
        return label;
    }

    // Compare accent-stripped forms - an unaccented search term (e.g. "cafe") matches an accented
    // label (e.g. "Café") on the backend, and stripping preserves character offsets 1-for-1 (each
    // accented character decomposes to its base letter plus a combining mark that gets removed, so
    // the base letter still lines up with the same position in the original, unstripped label).
    const matchIndex = stripAccents(label.toLowerCase()).indexOf(stripAccents(term.toLowerCase()));
    if (matchIndex === -1) {
        return label;
    }

    const matchEnd = matchIndex + term.length;
    return (
        <>
            {label.slice(0, matchIndex)}
            <span className={styles.searchMatchText}>{label.slice(matchIndex, matchEnd)}</span>
            {label.slice(matchEnd)}
        </>
    );
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

function convertPathsToTree({treeEntries, selected, isReversed, contentMenu, itemProps, viewMode, virtualizer, loading, openPaths, searchMatchedPaths = [], searchTerm = ''}) {
    const tree = [];
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

        const isSearchMatch = searchMatchedPaths.includes(treeEntry.path);

        const element = {
            id: treeEntry.path,
            label: isSearchMatch ? highlightSearchMatch(treeEntry.node.displayName, searchTerm) : treeEntry.node.displayName,
            hasChildren: treeEntry.hasChildren && treeEntry.openable,
            parent: parentPath,
            isSelectable: treeEntry.selectable,
            isClosable: treeEntry.depth > 0 && treeEntry.hasChildren,
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
            virtualRow: treeEntry.virtualRow,
            isLoading: loading && !treeEntry.open && treeEntry.openable && openPaths.includes(treeEntry.path),
            treeItemProps: {
                'data-sel-role': treeEntry.node.name,
                node: treeEntry.node,
                treeEntries,
                virtualRow: treeEntry.virtualRow,
                virtualizer,
                style: {
                    '--treeItem-depth': treeEntry.depth,
                    height: '32px',
                    top: 0,
                    left: 0,
                    position: 'absolute',
                    transform: `translateY(${treeEntry.virtualRow.start}px)`, // This should always be a `style` as it changes on scroll
                    width: '100%'
                },
                ...itemProps
            },
            isReadonly: treeEntry.node.primaryNodeType.name === 'jnt:navMenuText' && viewMode === 'pageBuilder'
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

export {convertPathsToTree, getParentPath, getAncestorPaths, findInTree};
