import React from 'react';
import PropTypes from 'prop-types';
import {ChevronRight as ChevronRightIcon, MoreHoriz} from '@material-ui/icons';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import ContentManagerConstants from '../../../../../ContentManager.constants';
import _ from 'lodash';
import BreadcrumbDisplay from './BreadcrumbDisplay';

const styles = theme => ({
    chevronSvg: {
        marginRight: theme.spacing.unit * 2,
        verticalAlign: 'middle',
        color: theme.palette.text.disabled
    }
});

const MAX_ITEMS_APPROPRIATE_FOR_UNCUT_DISPLAY = 4;
const MAX_UNCUT_ITEMS_ON_CUT_DISPLAY = 3;
const MAX_TOTAL_ITEMS_ON_CUT_DISPLAY = 6;
const MAX_FIRST_LABEL_LENGTH = 20;
const MAX_LABEL_LENGTH = 10;

export class Breadcrumb extends React.Component {
    render() {
        let {pickerEntries, path, rootLabel, t, rootPath, mode, classes} = this.props;

        let breadcrumbs = Breadcrumb.parseEntries(pickerEntries, path, rootLabel, t, rootPath, mode);
        let pathParts = path.split('/');

        if (_.isEmpty(breadcrumbs)) {
            return null;
        }

        // There is an issue likely originating from the Picker component that the first element of the array is empty when browsing files or content folders.
        // Remove that first element if so.
        if (!breadcrumbs[0]) {
            breadcrumbs = _.tail(breadcrumbs);
        }

        let firstVisibleIndex = 1;
        if (breadcrumbs.length > MAX_TOTAL_ITEMS_ON_CUT_DISPLAY) {
            firstVisibleIndex += (breadcrumbs.length - MAX_TOTAL_ITEMS_ON_CUT_DISPLAY);
        }
        // If we're browsing on sub contents of a table content, then we add the table content in the breadcrumb to give feedback to the
        // user about its location
        let nodename = breadcrumbs[breadcrumbs.length - 1].path.split('/');
        if (nodename[nodename.length - 1] !== pathParts[pathParts.length - 1]) {
            let parent = path.split('/');
            let uuid = breadcrumbs[breadcrumbs.length - 1].uuid;
            let breadcrumbToAdd = {};
            breadcrumbToAdd.uuid = uuid + parent[length - 1];
            breadcrumbToAdd.name = pathParts[pathParts.length - 1];
            breadcrumbToAdd.path = path;
            breadcrumbToAdd.siblings = [];
            // If last item is an ancestor of current element than we add element at the end
            if (_.includes(parent, nodename[nodename.length - 1])) {
                breadcrumbs[breadcrumbs.length] = breadcrumbToAdd;
            } else {
                breadcrumbs[breadcrumbs.length - 1] = breadcrumbToAdd;
            }
        }

        return (
            <div>

                {/* The very first element is always visible. */}
                {this.generateBreadcrumbItem(breadcrumbs, 0, MAX_FIRST_LABEL_LENGTH)}

                {/* Render an ellipsis in case we are about to cut any intermediate breadcrumb items. */}
                {firstVisibleIndex > 1 &&
                    <MoreHoriz className={classes.chevronSvg}/>
                }

                {breadcrumbs.map((breadcrumb, i) => {
                    if (i < firstVisibleIndex) {
                        return null;
                    }
                    return this.generateBreadcrumbItem(breadcrumbs, i, MAX_LABEL_LENGTH);
                })}
            </div>
        );
    }

    generateBreadcrumbItem(items, itemIndex, maxLabelLength) {
        let {handleSelect, classes} = this.props;
        let item = items[itemIndex];

        if (!item) {
            return null;
        }

        return (
            <span key={item.uuid} data-cm-role="breadcrumb">
                <BreadcrumbDisplay
                    id={item.uuid}
                    handleSelect={handleSelect}
                    node={item}
                    maxLabelLength={maxLabelLength}
                    trimLabel={(items.length > MAX_ITEMS_APPROPRIATE_FOR_UNCUT_DISPLAY) && (itemIndex < items.length - MAX_UNCUT_ITEMS_ON_CUT_DISPLAY)}
                />
                {itemIndex < items.length - 1 &&
                    <ChevronRightIcon fontSize="small" classes={{root: classes.chevronSvg}}/>
                }
            </span>
        );
    }

    static splitPath(path) {
        let [, , ...pathElements] = path.split('/');
        return pathElements;
    }

    static parseTypeFromPath(rootPath, path) {
        if (path.indexOf(rootPath + '/contents') !== -1) {
            return 'contents';
        }
        if (path.indexOf(rootPath + '/files') !== -1) {
            return 'files';
        }
        return 'files';
    }

    static parseEntries(entries, selectedPath, rootLabel, t, rootPath, mode) {
        // Process these nodes
        let breadcrumbs = [];
        let rootType = this.parseTypeFromPath(rootPath, selectedPath);
        let selectedPathParts = this.splitPath(selectedPath);

        for (let i in entries) {
            if (Object.prototype.hasOwnProperty.call(entries, i)) {
                let index = parseInt(i, 10);
                let entry = entries[i];
                let entryPathParts = this.splitPath(entry.path);

                if (entryPathParts.length > selectedPathParts.length) {
                    // Skip, our selections does not go this deep.
                    continue;
                }

                // Verify this is the same path along the tree that is currently selected.
                // We are checking parent of current entry
                let parentIndex = entryPathParts.length - 2;
                if (entryPathParts[parentIndex] !== undefined && selectedPathParts[parentIndex] !== entryPathParts[parentIndex]) {
                    // This is a different path, we will skip it as it is not part of our current breadcrumb!
                    continue;
                }

                let breadcrumb = breadcrumbs[entryPathParts.length - 1];

                if (breadcrumb === undefined) {
                    // Start new object, we are at a deeper level then before.
                    breadcrumb = {};
                    breadcrumb.name = breadcrumbs.length === 0 ? rootLabel : entry.node.displayName;
                    breadcrumb.uuid = entry.node.uuid;
                    breadcrumb.path = entry.node.path;
                    breadcrumb.type = entry.node.primaryNodeType.name;
                    breadcrumb.pathType = rootType;
                    breadcrumb.siblings = [];
                }

                // Add sibling to list (including first entry)
                let sibling = {
                    uuid: entry.node.uuid,
                    name: breadcrumbs.length === 0 ? rootLabel : entry.node.displayName,
                    path: entry.path,
                    pathType: breadcrumb.pathType,
                    type: entry.node.primaryNodeType.name
                };

                // Handle root siblings
                if (index === 0) {
                    // @TODO update using gql query to retrieve root nodes when component is loaded
                    const siblingsToBeAdded = [];
                    if (mode === ContentManagerConstants.mode.FILES) {
                        siblingsToBeAdded.push({
                            uuid: 'files_id',
                            name: t('label.contentManager.browseFiles'),
                            path: rootPath + '/files',
                            mode: 'browse-files',
                            pathType: 'files',
                            type: 'jnt:folder'
                        });
                    } else {
                        siblingsToBeAdded.push({
                            uuid: 'contents_id',
                            name: t('label.contentManager.browseFolders'),
                            mode: 'browse',
                            path: rootPath + '/contents',
                            pathType: 'contents',
                            type: 'jnt:contentFolder'
                        });
                        siblingsToBeAdded.push({
                            uuid: 'pages_id',
                            name: t('label.contentManager.browsePages'),
                            path: rootPath,
                            mode: 'browse',
                            pathType: 'pages',
                            type: 'jnt:virtualsite'
                        });
                    }
                    for (let j in siblingsToBeAdded) {
                        if (Object.prototype.hasOwnProperty.call(siblingsToBeAdded, j)) {
                            breadcrumb.siblings.push(siblingsToBeAdded[j].type === breadcrumb.type ? sibling : siblingsToBeAdded[j]);
                        }
                    }
                } else {
                    breadcrumb.siblings.push(sibling);
                }

                // If this path is the selected path, then update root breadcrumb with this entries information.
                if (selectedPathParts.slice(0, entryPathParts.length).join('/') === entryPathParts.join('/')) {
                    breadcrumb.name = breadcrumbs.length === 0 ? rootLabel : entry.node.displayName;
                    breadcrumb.uuid = entry.node.uuid;
                    breadcrumb.path = entry.node.path;
                    breadcrumb.type = entry.node.primaryNodeType.name;
                }

                breadcrumbs[entryPathParts.length - 1] = breadcrumb;
            }
        }

        return breadcrumbs;
    }
}

Breadcrumb.propTypes = {
    path: PropTypes.string.isRequired,
    handleSelect: PropTypes.func.isRequired,
    rootLabel: PropTypes.string,
    rootPath: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired
};

Breadcrumb.defaultProps = {
    rootLabel: 'Root'
};

export default translate()(withStyles(styles)(Breadcrumb));
