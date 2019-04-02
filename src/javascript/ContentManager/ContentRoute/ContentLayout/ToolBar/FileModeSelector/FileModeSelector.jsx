import React from 'react';
import {MenuItem} from '@material-ui/core';
import {Select} from '@jahia/ds-mui-theme';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {setMode, setSize} from '../../FilesGrid/FilesGrid.redux-actions';
import PropTypes from 'prop-types';

export const FileModeSelector = ({t, mode, size, onChange, setSize}) => {
    const handleChange = e => {
        let selectedMode = e.target.value;
        switch (selectedMode) {
            case 'list-view':
                onChange('list');
                break;
            case 'thumbnail':
                onChange('grid');
                if (size !== 1) {
                    setSize(1);
                }
                break;
            case 'detailed-view':
                onChange('grid');
                if (size !== 5) {
                    setSize(5);
                }
                break;
            default:
                if (mode === 'list') {
                    onChange('grid');
                }
        }
    };

    let select = mode === 'grid' && size === 1 ? 'thumbnail' : (mode === 'grid' ? 'detailed-view' : 'list-view');

    return (
        <Select
            autoWidth
            value={select}
            variant="normal"
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
    setSize: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
};

let mapStateToProps = state => ({
    mode: state.filesGrid.mode,
    size: state.filesGrid.size
});

let mapDispatchToProps = dispatch => ({
    onChange: mode => dispatch(setMode(mode)),
    setSize: size => dispatch(setSize(size))
});

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    translate(),
)(FileModeSelector);

