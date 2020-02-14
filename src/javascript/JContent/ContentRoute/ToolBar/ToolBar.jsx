import React from 'react';
import PropTypes from 'prop-types';
import {Toolbar, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {connect} from 'react-redux';
import {compose} from 'react-apollo';
import JContentConstants from '../../JContent.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from './BrowseControlBar';
import {DisplayActions} from '@jahia/ui-extender';
import {iconButtonRenderer} from '@jahia/react-material';
import {withTranslation} from 'react-i18next';

const styles = theme => ({
    spacer: {
        width: theme.spacing.unit * 2
    }
});

export class ToolBar extends React.Component {
    render() {
        const {classes, mode, selection, t} = this.props;

        return (
            <Toolbar variant="dense">
                {(mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH) ?
                    <SearchControlBar showActions={selection.length === 0}/> :
                    <React.Fragment>
                        <BrowseControlBar showActions={selection.length === 0}/>
                    </React.Fragment>}
                {selection.length > 0 &&
                    <React.Fragment>
                        <Typography variant="caption" data-cm-role="selection-infos" data-cm-selection-size={selection.length}>
                            {t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length})}
                        </Typography>
                        <div className={classes.spacer}/>
                        <DisplayActions
                            target="selectedContentActions"
                            context={{paths: selection}}
                            render={iconButtonRenderer({color: 'inherit', size: 'compact'})}
                        />
                    </React.Fragment>}
            </Toolbar>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.jcontent.mode,
    selection: state.jcontent.selection
});

ToolBar.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    selection: PropTypes.array.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles),
    connect(mapStateToProps)
)(ToolBar);
