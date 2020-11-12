import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {filesgridSetMode} from '../../ContentLayout/FilesGrid/FilesGrid.redux';
import JContentConstants from '../../../JContent.constants';
import {Button, ViewGrid, ViewList} from '@jahia/moonstone';

const localStorage = window.localStorage;

const GRID = JContentConstants.mode.GRID;
const LIST = JContentConstants.mode.LIST;
const THUMBNAILS = JContentConstants.THUMBNAILS;
const LIST_VIEW = JContentConstants.LIST;
const FILE_SELECTOR_MODE = JContentConstants.localStorageKeys.filesSelectorMode;

const buttons = [THUMBNAILS, LIST_VIEW];
const icons = {
    [THUMBNAILS]: <ViewGrid/>,
    [LIST_VIEW]: <ViewList/>
};

export const FileModeSelector = () => {
    const {t} = useTranslation();

    const {mode} = useSelector(state => ({
        mode: state.jcontent.filesGrid.mode
    }));

    const dispatch = useDispatch();
    const onChange = mode => dispatch(filesgridSetMode(mode));

    const handleChange = selectedMode => {
        switch (selectedMode) {
            case LIST_VIEW:
                onChange(LIST);
                localStorage.setItem(FILE_SELECTOR_MODE, LIST);
                break;
            case THUMBNAILS:
                onChange(GRID);
                localStorage.setItem(FILE_SELECTOR_MODE, GRID);
                break;
            default:
                if (mode === LIST) {
                    onChange(GRID);
                }
        }
    };

    const select = mode === GRID ? THUMBNAILS : LIST_VIEW;

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

