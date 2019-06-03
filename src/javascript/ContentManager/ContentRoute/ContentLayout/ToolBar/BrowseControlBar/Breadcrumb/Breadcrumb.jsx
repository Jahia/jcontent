import React from 'react';
import BreadcrumbItem from './BreadcrumbItem';
import BreadcrumbHiddenItems from './BreadcrumbHiddenItems';
import {ChevronRight as ChevronRightIcon} from '@material-ui/icons';
import PropTypes from 'prop-types';
import {getLastParent} from './Breadcrumb.utils';
import * as _ from 'lodash';
import {withStyles} from '@material-ui/core';

const styles = theme => ({
    container: {
        display: 'flex',
        flex: 10,
        minWidth: 0
    },
    chevronSvg: {
        verticalAlign: 'middle',
        color: theme.palette.text.disabled
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        minWidth: 0
    }
});

export const Breadcrumb = ({breadcrumbs, classes, mode, selectItem}) => {
    let items = _.clone(breadcrumbs);
    let lastParent = getLastParent(breadcrumbs);
    let hiddenParents = breadcrumbs.filter((b, i) => i > 0 && i < lastParent && lastParent > 3);
    let hiddenContents = breadcrumbs.filter((b, i) => i > lastParent && i < breadcrumbs.length - 1 && (breadcrumbs.length - lastParent) > 1);

    return (
        <div className={classes.container}>
            {breadcrumbs.map((breadcrumb, i) => {
                let showLabel = breadcrumb.type === 'jnt:page' || breadcrumb.type === 'jnt:folder' ||
                    breadcrumb.type === 'jnt:contentFolder' || breadcrumb.type === 'jnt:virtualsite' || i === items.length - 1;
                let isHidden = hiddenParents.indexOf(breadcrumb) > -1 || hiddenContents.indexOf(breadcrumb) > -1;
                if (isHidden) {
                    let showHiddenList;
                    if (hiddenParents.indexOf(breadcrumb) === 0) {
                        showHiddenList = hiddenParents;
                    }

                    if (hiddenContents.indexOf(breadcrumb) === 0) {
                        showHiddenList = hiddenContents;
                    }

                    if (showHiddenList) {
                        return (
                            <span key={breadcrumb.uuid}
                                  data-cm-role="breadcrumb"
                                  className={classes.breadcrumb}
                            >
                                <BreadcrumbHiddenItems
                                    hidden={showHiddenList}
                                    selectItem={path => selectItem(mode, path, {sub: false})}
                                />
                                <ChevronRightIcon fontSize="small"
                                                  classes={{root: classes.chevronSvg}}/>
                            </span>
                        );
                    }
                }

                if (!isHidden) {
                    return (
                        <span key={breadcrumb.uuid}
                              data-cm-role="breadcrumb"
                              className={classes.breadcrumb}
                        >
                            <BreadcrumbItem
                                item={breadcrumb}
                                selectItem={path => selectItem(mode, path, {sub: false})}
                                showLabel={showLabel}
                            />
                            {(i < items.length - 1) &&
                            <ChevronRightIcon fontSize="small" classes={{root: classes.chevronSvg}}/>
                            }
                        </span>
                    );
                }

                return false;
            })}
        </div>
    );
};

Breadcrumb.propTypes = {
    breadcrumbs: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    selectItem: PropTypes.func.isRequired
};

export default withStyles(styles)(Breadcrumb);
