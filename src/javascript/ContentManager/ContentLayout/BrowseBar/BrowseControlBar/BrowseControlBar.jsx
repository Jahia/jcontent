import React from 'react';
import {translate} from 'react-i18next';
import {IconButton, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import ContentBreadcrumbs from './ContentBreadcrumbs';
import ContentManagerConstants from '../../../ContentManager.constants';
import FilesGridSizeSelector from './FilesGridSizeSelector';
import FilesGridModeSelector from './FilesGridModeSelector';
import {buttonRenderer, DisplayActions} from '@jahia/react-material';
import connect from 'react-redux/es/connect/connect';
import {Refresh} from '@material-ui/icons';
import {refetchContentTreeAndListData, setContentListDataRefetcher, setRefetcher} from '../../../ContentManager.refetches';

const styles = theme => ({
    grow: {
        flex: 1
    },
    buttons: {
        '&&': {
            marginRight: theme.spacing.unit
        }
    }
});

export class BrowseControlBar extends React.Component {
    isBrowsing() {
        let {mode} = this.props;
        return (mode === ContentManagerConstants.mode.BROWSE || mode === ContentManagerConstants.mode.FILES);
    }

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ('/sites/' + siteKey));
    }

    setContentRefetcher(refetchingData) {
        setContentListDataRefetcher(refetchingData);
    }

    setTreeRefetcher(type) {
        return refetchingData => setRefetcher(type, refetchingData);
    }

    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    render() {
        let {
            path, classes, mode, contentTreeConfigs
        } = this.props;
        return (
            <React.Fragment>
                <ContentBreadcrumbs mode={mode}/>
                <div className={classes.grow}/>
                {mode === ContentManagerConstants.mode.FILES &&
                <React.Fragment>
                    <FilesGridSizeSelector/>
                    <FilesGridModeSelector/>
                </React.Fragment>
                }
                <IconButton color="inherit" data-cm-role="content-list-refresh-button" onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}>
                    <Refresh/>
                </IconButton>
                {this.isBrowsing() && !this.isRootNode() &&
                <DisplayActions target="tableHeaderActions"
                                context={{path: path}}
                                render={buttonRenderer({variant: 'contained', color: 'primary', size: 'small', classes: {root: classes.buttons}}, true)}/>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    path: state.path,
    mode: state.mode,
    siteKey: state.site
});

export default compose(
    translate(),
    connect(mapStateToProps),
    withStyles(styles),
)(BrowseControlBar);
