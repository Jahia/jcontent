import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {filesgridSetMode} from '../../ContentLayout/FilesGrid/FilesGrid.redux';
import JContentConstants from '../../../JContent.constants';
import {Button, ViewGrid, ViewList} from '@jahia/moonstone';

const localStorage = window.localStorage;

const GRID = JContentConstants.mode.GRID;
const LIST = JContentConstants.mode.LIST;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;

const buttons = [GRID, LIST];
const icons = {
    [GRID]: <ViewGrid/>,
    [LIST]: <ViewList/>
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
        buttons.map(v => (
            <Button key={v}
                    data-sel-role={'set-view-mode-' + v}
                    aria-selected={mode === v}
                    color={mode === v ? 'accent' : 'default'}
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

