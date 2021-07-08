import React from 'react';
import {Button, ViewList, ViewTree} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '../../../JContent.constants';
import {useDispatch, useSelector} from 'react-redux';
import {setContentFolderViewMode} from '../../ContentLayout/StructuredView/StructuredView.redux';

const localStorage = window.localStorage;

const FLATLIST = JContentConstants.viewMode.flat;
const STRUCTUREDVIEW = JContentConstants.viewMode.structured;
const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;

const buttons = [FLATLIST, STRUCTUREDVIEW];
const icons = {
    [FLATLIST]: <ViewList/>,
    [STRUCTUREDVIEW]: <ViewTree/>
};

export const ContentFolderViewModeSelector = () => {
    const {t} = useTranslation();

    let {viewMode} = useSelector(state => ({
        viewMode: state.jcontent.contentFolder.viewMode
    }));

    const dispatch = useDispatch();
    const onChange = vm => dispatch(setContentFolderViewMode(vm));

    const handleChange = selectedViewMode => {
        onChange(selectedViewMode);
        localStorage.setItem(VIEW_MODE, selectedViewMode);
    };

    return (
        buttons.map(v => (
            <Button key={v}
                    data-sel-role={'sel-view-mode-' + v}
                    aria-selected={viewMode === v}
                    color={viewMode === v ? 'accent' : 'default'}
                    size="default"
                    variant="ghost"
                    title={t('jcontent:label.contentManager.view.' + v)}
                    icon={icons[v]}
                    onClick={() => handleChange(v)}
            />
        ))
    );
};

export default ContentFolderViewModeSelector;
