import React from 'react';
import {Menu as ListIcon, ViewModule} from '@material-ui/icons';
import {Tooltip} from '@material-ui/core';
import {IconButton} from '@jahia/ds-mui-theme';
import {translate} from 'react-i18next';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {setMode} from '../../../FilesGrid/FilesGrid.redux-actions';

export class FilesGridModeSelector extends React.Component {
    render() {
        const {mode, onChange, t} = this.props;
        return (
            <Tooltip
                title={t(mode === 'list' ? 'label.contentManager.filesGrid.toggleGridDisplay' : 'label.contentManager.filesGrid.toggleListDisplay')}
                leaveDelay={200}
            >
                <IconButton icon={mode === 'list' ? <ViewModule/> : <ListIcon/>} data-cm-role={mode === 'list' ? 'view-mode-grid' : 'view-mode-list'} color="inherit" onClick={() => onChange(mode === 'list' ? 'grid' : 'list')}/>
            </Tooltip>
        );
    }
}

export default compose(
    connect(state => ({mode: state.filesGrid.mode}), dispatch => ({onChange: mode => dispatch(setMode(mode))})),
    translate(),
)(FilesGridModeSelector);
