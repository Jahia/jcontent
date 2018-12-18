import React from 'react';
import {translate} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import ContentBreadcrumbs from './breadcrumb/ContentBreadcrumbs';
import Constants from './constants';
import FilesGridSizeSelector from './filesGrid/FilesGridSizeSelector';
import FilesGridModeSelector from './filesGrid/FilesGridModeSelector';
import {buttonRenderer, DisplayActions} from '@jahia/react-material';
import connect from 'react-redux/es/connect/connect';

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

class CmBrowseControlBar extends React.Component {
    isBrowsing() {
        let {mode} = this.props;
        return (mode === Constants.mode.BROWSE || mode === Constants.mode.FILES);
    }

    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ('/sites/' + siteKey));
    }

    render() {
        let {
            path, classes, mode
        } = this.props;
        return (
            <React.Fragment>
                <ContentBreadcrumbs mode={mode}/>
                <div className={classes.grow}/>

                {mode === Constants.mode.FILES &&
                <React.Fragment>
                    <FilesGridSizeSelector/>
                    <FilesGridModeSelector/>
                </React.Fragment>
                }
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
)(CmBrowseControlBar);
