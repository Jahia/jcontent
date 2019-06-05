import React from 'react';
import {MenuItem} from '@material-ui/core';
import {Select} from '@jahia/design-system-kit';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {setMode, setGridMode} from '../../FilesGrid/FilesGrid.redux-actions';
import PropTypes from 'prop-types';

export const FileModeSelector = ({t, mode, gridMode, onChange, onGridMode}) => {
    const handleChange = e => {
        let selectedMode = e.target.value;
        switch (selectedMode) {
            case 'list-view':
                onChange('list');
                break;
            case 'thumbnail':
                onChange('grid');
                if (gridMode !== 'thumbnail') {
                    onGridMode('thumbnail');
                }

                break;
            case 'detailed-view':
                onChange('grid');
                if (gridMode !== 'detailed') {
                    onGridMode('detailed');
                }

                break;
            default:
                if (mode === 'list') {
                    onChange('grid');
                }
        }
    };

    let select = mode === 'grid' && gridMode === 'thumbnail' ? 'thumbnail' : (mode === 'grid' ? 'detailed-view' : 'list-view');

    return (
        <Select
            autoWidth
            data-cm-role={'view-mode-' + select}
            value={select}
            variant="ghost"
            onChange={e => handleChange(e)}
        >
            <MenuItem value="thumbnail">{t('label.contentManager.filesGrid.selectThumbnailView')}</MenuItem>
            <MenuItem value="list-view">{t('label.contentManager.filesGrid.selectListView')}</MenuItem>
            <MenuItem value="detailed-view">{t('label.contentManager.filesGrid.selectDetailedView')}</MenuItem>
        </Select>
    );
};

FileModeSelector.propTypes = {
    t: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onGridMode: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    gridMode: PropTypes.string.isRequired
};

let mapStateToProps = state => ({
    mode: state.filesGrid.mode,
    gridMode: state.filesGrid.gridMode
});

let mapDispatchToProps = dispatch => ({
    onChange: mode => dispatch(setMode(mode)),
    onGridMode: gridMode => dispatch(setGridMode(gridMode))
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(),
)(FileModeSelector);

