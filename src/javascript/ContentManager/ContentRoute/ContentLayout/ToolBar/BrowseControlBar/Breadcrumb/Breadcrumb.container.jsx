import React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import {compose, Query, withApollo} from 'react-apollo';
import {breadcrumbQuery} from './Breadcrumb.gql-queries';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {cmGoto} from '../../../../../ContentManager.redux-actions';
import {ChevronRight as ChevronRightIcon} from '@material-ui/icons';
import {buildBreadcrumbItems, getLastParent} from './Breadcrumb.utils';
import * as _ from 'lodash';
import BreadcrumbItem from './BreadcrumbItem';
import BreadcrumbHiddenItems from './BreadcrumbHiddenItems';

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

export const BreadcrumbContainer = ({path, classes, language, selectItem, mode, t, site}) => {
    let queryParams = {path: path, type: 'jnt:contentList', language: language};
    let key = JSON.stringify(queryParams);
    let breadcrumbs = [];
    return (
        <Query key={key} query={breadcrumbQuery} variables={queryParams}>
            {({loading, error, data}) => {
                if (error) {
                    let message = t('label.contentManager.error.queryingContent', {details: (error.message ? error.message : '')});
                    console.error(message);
                }
                if (loading) {
                    // Do nothing
                }
                if (data && data.jcr && data.jcr.nodeByPath) {
                    breadcrumbs = buildBreadcrumbItems(path, data, mode, t, site);
                }
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
            }}
        </Query>
    );
};

const mapStateToProps = state => ({
    path: state.path,
    site: state.site,
    language: state.language,
    mode: state.mode
});

const mapDispatchToProps = dispatch => ({
    selectItem: (mode, path, params) => dispatch(cmGoto({mode, path, params}))
});

BreadcrumbContainer.propTypes = {
    path: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired,
    selectItem: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    site: PropTypes.string.isRequired
};

export default compose(
    translate(),
    withApollo,
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(BreadcrumbContainer);
