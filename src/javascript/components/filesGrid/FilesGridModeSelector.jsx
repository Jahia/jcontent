import React from 'react';
import {Menu as ListIcon, ViewModule} from '@material-ui/icons';
import {Button, Tooltip, withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {setMode} from './redux/actions';

const styles = ({
    iconSize: {
        fontSize: '1.5em'
    }
});

class FilesGridModeSelector extends React.Component {
    render() {
        const {mode, onChange, classes, t} = this.props;
        return (
            <Tooltip
                title={t(mode === 'list' ? 'label.contentManager.filesGrid.toggleGridDisplay' : 'label.contentManager.filesGrid.toggleListDisplay')}
                leaveDelay={200}
                >
                <Button data-cm-role={mode === 'list' ? 'view-mode-grid' : 'view-mode-list'} onClick={() => onChange(mode === 'list' ? 'grid' : 'list')}>
                    {mode === 'list' ? <ViewModule className={classes.iconSize}/> : <ListIcon className={classes.iconSize}/>}
                </Button>
            </Tooltip>
        );
    }
}

export default compose(
    connect(state => ({mode: state.filesGrid.mode}), dispatch => ({onChange: mode => dispatch(setMode(mode))})),
    translate(),
    withStyles(styles)
)(FilesGridModeSelector);
