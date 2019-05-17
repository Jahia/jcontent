import React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import {compose, Query, withApollo} from 'react-apollo';
import {breadcrumbQuery} from './Breadcrumb.gql-queries';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {cmGoto} from '../../../../../../ContentManager.redux-actions';
import {ChevronRight as ChevronRightIcon} from '@material-ui/icons';
import {buildBreadcrumbItems, getHiddenParents, getHiddenContents} from './Breadcrumb.utils';
import BreadcrumbDisplay from './BreadcrumbDisplay';
import * as _ from 'lodash';

const styles = theme => ({
    container: {
        display: 'flex'
    },
    chevronSvg: {
        verticalAlign: 'middle',
        color: theme.palette.text.disabled
    },
    breadcrumb: {
        display: 'flex',
        alignItems: 'center'
    }
});

export class BreadcrumbContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openHiddenParents: null,
            openHiddenContents: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClick(event, id) {
        switch (id) {
            case 'parent':
                this.setState({
                    openHiddenParents: event.currentTarget
                });
                break;
            case 'content':
                this.setState({
                    openHiddenContents: event.currentTarget
                });
                break;
            default:
                // Nothing
        }
    }

    handleClose() {
        this.setState({
            openHiddenParents: null,
            openHiddenContents: null
        });
    }

    render() {
        let {path, classes, language, selectItem, mode, t, site} = this.props;
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
                    let hiddenParents = getHiddenParents(breadcrumbs);
                    let hiddenContents = getHiddenContents(breadcrumbs);
                    return (
                        <div className={classes.container}>
                            {breadcrumbs.map((breadcrumb, i) => {
                                let showLabel = breadcrumb.type === 'jnt:page' || breadcrumb.type === 'jnt:folder' ||
                                    breadcrumb.type === 'jnt:contentFolder' || breadcrumb.type === 'jnt:virtualsite' || i === items.length - 1;
                                let hideParent = _.find(hiddenParents, parent => parent.uuid === breadcrumb.uuid);
                                let hideContent = _.find(hiddenContents, content => content.uuid === breadcrumb.uuid);
                                return (
                                    <span key={breadcrumb.uuid} data-cm-role="breadcrumb" className={classes.breadcrumb}>
                                        <BreadcrumbDisplay
                                        id={breadcrumb.uuid}
                                        node={breadcrumb}
                                        maxLabelLength={15}
                                        selectItem={path => selectItem(mode, path, {sub: false})}
                                        showLabel={showLabel}
                                        display={items.length < 4 || (!hideParent && !hideContent)}
                                        mode={mode}
                                        hiddenParents={hiddenParents}
                                        hiddenContents={hiddenContents}
                                        openHiddenParents={this.state.openHiddenParents}
                                        openHiddenContents={this.state.openHiddenContents}
                                        handleClick={this.handleClick}
                                        handleClose={this.handleClose}
                                    />
                                        {(i < items.length - 1 && !hideParent && !hideContent) &&
                                        <ChevronRightIcon fontSize="small" classes={{root: classes.chevronSvg}}/>
                                        }
                                    </span>
                                );
                            })}
                        </div>
                    );
                }}
            </Query>
        );
    }
}

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
