import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {filesgridSetMode} from '../../ContentLayout/FilesGrid/FilesGrid.redux';
import JContentConstants from '~/JContent/JContent.constants';
import {ViewGrid, ViewList, Dropdown} from '@jahia/moonstone';

const localStorage = window.localStorage;

const GRID = JContentConstants.mode.GRID;
const LIST = JContentConstants.mode.LIST;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;

const buttons = [GRID, LIST];
const icons = {
    [GRID]: <ViewGrid/>,
    [LIST]: <ViewList/>
};

const tableViewDropdownData = (t, mode) => {
    return buttons.map(v => ({
        label: t(`jcontent:label.contentManager.filesGrid.${v}`),
        value: v,
        iconStart: icons[v],
        attributes: {
            'aria-selected': mode === v,
            'data-sel-role': `sel-view-mode-${v}`
        }
    }));
};

export const FileModeSelector = () => {
    const {t} = useTranslation();

    const {mode} = useSelector(state => ({
        mode: state.jcontent.filesGrid.mode
    }));

    const dispatch = useDispatch();
    const onChange = mode => dispatch(filesgridSetMode(mode));

    const handleChange = selectedMode => {
        onChange(selectedMode);
        localStorage.setItem(FILE_SELECTOR_MODE, selectedMode);
    };

    return (
        <Dropdown data={tableViewDropdownData(t, mode)}
                  data-sel-role="sel-view-mode-dropdown"
                  label={t(`jcontent:label.contentManager.filesGrid.${mode}`)}
                  value={mode}
                  onChange={(e, item) => handleChange(item.value)}
        />
    );
};

export default FileModeSelector;

