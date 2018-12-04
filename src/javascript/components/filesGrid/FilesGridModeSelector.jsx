import React from 'react';
import {Menu as ListIcon, ViewModule} from '@material-ui/icons';
import {IconButton, Tooltip} from '@material-ui/core';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {setMode} from './redux/actions';

class FilesGridModeSelector extends React.Component {
    render() {
        const {mode, onChange, t} = this.props;
        return (
            <Tooltip
                title={t(mode === 'list' ? 'label.contentManager.filesGrid.toggleGridDisplay' : 'label.contentManager.filesGrid.toggleListDisplay')}
                leaveDelay={200}
                >
                <IconButton data-cm-role={mode === 'list' ? 'view-mode-grid' : 'view-mode-list'} color="inherit" onClick={() => onChange(mode === 'list' ? 'grid' : 'list')}>
                    {mode === 'list' ? <ViewModule/> : <ListIcon/>}
                </IconButton>
            </Tooltip>
        );
    }
}

export default compose(
    connect(state => ({mode: state.filesGrid.mode}), dispatch => ({onChange: mode => dispatch(setMode(mode))})),
    translate(),
)(FilesGridModeSelector);
