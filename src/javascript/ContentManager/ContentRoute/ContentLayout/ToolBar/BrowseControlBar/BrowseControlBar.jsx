import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import {Button} from '@jahia/design-system-kit';
import {compose} from 'react-apollo';
import {buttonRenderer, DisplayActions} from '@jahia/react-material';
import FileModeSelector from '../FileModeSelector';
import ContentManagerConstants from '../../../../ContentManager.constants';
import connect from 'react-redux/es/connect/connect';
import {Refresh} from '@material-ui/icons';
import {refetchContentTreeAndListData} from '../../../../ContentManager.refetches';
import Breadcrumb from './Breadcrumb';

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
    isRootNode() {
        let {path, siteKey} = this.props;
        return (path === ('/sites/' + siteKey));
    }

    refreshContentsAndTree(contentTreeConfigs) {
        refetchContentTreeAndListData(contentTreeConfigs);
    }

    render() {
        let {
            path, classes, mode, contentTreeConfigs, showActions, t
        } = this.props;

        return (
            <React.Fragment>
                <Breadcrumb/>
                <div className={classes.grow}/>
                {showActions && mode === ContentManagerConstants.mode.FILES &&
                    <FileModeSelector/>
                }
                {showActions && !this.isRootNode() &&
                    <DisplayActions
                        target="tableHeaderActions"
                        context={{path: path}}
                        render={buttonRenderer({variant: 'ghost'}, true)}
                    />
                }
                {showActions &&
                <Button variant="ghost" icon={<Refresh/>} data-cm-role="content-list-refresh-button" onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}><span>{t('label.contentManager.refresh')}</span></Button>
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

BrowseControlBar.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    contentTreeConfigs: PropTypes.object,
    mode: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    showActions: PropTypes.bool.isRequired,
    siteKey: PropTypes.string.isRequired
};

export default compose(
    connect(mapStateToProps),
    translate(),
    withStyles(styles),
)(BrowseControlBar);
