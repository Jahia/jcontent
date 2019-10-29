import React from 'react';
import {MenuItem} from '@material-ui/core';
import {Select} from '@jahia/design-system-kit';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {setMode, setGridMode} from '../../FilesGrid/FilesGrid.redux-actions';
import PropTypes from 'prop-types';
import ContentManagerConstants from '../../../../ContentManager.constants';

const localStorage = window.localStorage;

const GRID = ContentManagerConstants.mode.GRID;
const LIST = ContentManagerConstants.mode.LIST;
const DETAILED_VIEW = ContentManagerConstants.gridMode.DETAILED_VIEW;
const DETAILED = ContentManagerConstants.gridMode.DETAILED;
const LIST_VIEW = ContentManagerConstants.gridMode.LIST;
const THUMBNAIL = ContentManagerConstants.gridMode.THUMBNAIL;
const FILE_SELECTOR_MODE = ContentManagerConstants.localStorageKeys.filesSelectorMode;
const FILE_SELECTOR_GRID_MODE = ContentManagerConstants.localStorageKeys.filesSelectorGridMode;

export const FileModeSelector = ({t, mode, gridMode, onChange, onGridMode}) => {
    const handleChange = e => {
        let selectedMode = e.target.value;
        switch (selectedMode) {
            case LIST_VIEW:
                onChange(LIST);
                localStorage.setItem(FILE_SELECTOR_MODE, LIST);
                break;
            case THUMBNAIL:
                onChange(GRID);
                localStorage.setItem(FILE_SELECTOR_MODE, GRID);
                if (gridMode !== THUMBNAIL) {
                    onGridMode(THUMBNAIL);
                    localStorage.setItem(FILE_SELECTOR_GRID_MODE, THUMBNAIL);
                }

                break;
            case DETAILED_VIEW:
                onChange(GRID);
                localStorage.setItem(FILE_SELECTOR_MODE, GRID);
                if (gridMode !== DETAILED) {
                    onGridMode(DETAILED);
                    localStorage.setItem(FILE_SELECTOR_GRID_MODE, DETAILED);
                }

                break;
            default:
                if (mode === LIST) {
                    onChange(GRID);
                }
        }
    };

    let select = mode === GRID && gridMode === THUMBNAIL ? THUMBNAIL : (mode === GRID ? DETAILED_VIEW : LIST_VIEW);

    return (
        <Select
            autoWidth
            data-cm-role={'view-mode-' + select}
            value={select}
            variant="ghost"
            onChange={e => handleChange(e)}
        >
            <MenuItem value={THUMBNAIL}>{t('label.contentManager.filesGrid.selectThumbnailView')}</MenuItem>
            <MenuItem value={LIST_VIEW}>{t('label.contentManager.filesGrid.selectListView')}</MenuItem>
            <MenuItem value={DETAILED_VIEW}>{t('label.contentManager.filesGrid.selectDetailedView')}</MenuItem>
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

