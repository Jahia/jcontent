import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {withStyles} from '@material-ui/core';
import {Button} from '@jahia/moonstone';
import {compose} from '~/utils';
import {DisplayActions} from '@jahia/ui-extender';
import FileModeSelector from '../FileModeSelector';
import JContentConstants from '../../../JContent.constants';
import connect from 'react-redux/es/connect/connect';
import {Refresh} from '@material-ui/icons';
import {refetchContentTreeAndListData} from '../../../JContent.refetches';
import {getButtonRenderer} from '~/utils/getButtonRenderer';

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

const ButtonRenderer = getButtonRenderer({size: 'small', variant: 'ghost'});

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
                <div className={classes.grow}/>
                {showActions && mode === JContentConstants.mode.MEDIA &&
                <FileModeSelector/>}
                {showActions && !this.isRootNode() &&
                <DisplayActions target="tableHeaderActions" context={{path: path}} render={ButtonRenderer}/>}
                {showActions &&
                <Button variant="ghost"
                        size="small"
                        label={t('jcontent:label.contentManager.refresh')}
                        icon={<Refresh/>}
                        data-cm-role="content-list-refresh-button"
                        onClick={() => this.refreshContentsAndTree(contentTreeConfigs)}
                />}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    path: state.jcontent.path,
    mode: state.jcontent.mode,
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
    withTranslation(),
    withStyles(styles)
)(BrowseControlBar);
