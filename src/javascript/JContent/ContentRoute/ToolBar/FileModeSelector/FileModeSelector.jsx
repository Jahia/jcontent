import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {filesgridSetGridMode, filesgridSetMode} from '../../ContentLayout/FilesGrid/FilesGrid.redux';
import JContentConstants from '../../../JContent.constants';
import {Button, ViewComfy, ViewGrid, ViewList} from '@jahia/moonstone';

const localStorage = window.localStorage;

const GRID = JContentConstants.mode.GRID;
const LIST = JContentConstants.mode.LIST;
const DETAILED = JContentConstants.gridMode.DETAILED;
const LIST_VIEW = JContentConstants.gridMode.LIST;
const THUMBNAIL = JContentConstants.gridMode.THUMBNAIL;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;
const FILE_SELECTOR_GRID_MODE = JContentConstants.localStorageKeys.filesSelectorGridMode;

const buttons = [THUMBNAIL, DETAILED, LIST_VIEW];
const icons = {
    [THUMBNAIL]: <ViewComfy/>,
    [DETAILED]: <ViewGrid/>,
    [LIST_VIEW]: <ViewList/>
};

export const FileModeSelector = () => {
    const {t} = useTranslation();

    const {mode, gridMode} = useSelector(state => ({
        mode: state.jcontent.filesGrid.mode,
        gridMode: state.jcontent.filesGrid.gridMode
    }));

    const dispatch = useDispatch();
    const onChange = mode => dispatch(filesgridSetMode(mode));
    const onGridMode = gridMode => dispatch(filesgridSetGridMode(gridMode));

    const handleChange = selectedMode => {
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
            case DETAILED:
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

    let select = mode === GRID && gridMode === THUMBNAIL ? THUMBNAIL : (mode === GRID ? DETAILED : LIST_VIEW);

    return (
        buttons.map(v => (
            <Button key={v}
                    data-sel-role={'set-view-mode-' + v}
                    aria-selected={select === v}
                    color={select === v ? 'accent' : 'default'}
                    title={t('jcontent:label.contentManager.filesGrid.' + v)}
                    size="default"
                    variant="ghost"
                    icon={icons[v]}
                    onClick={() => handleChange(v)}
            />
        ))
    );
};

export default FileModeSelector;

