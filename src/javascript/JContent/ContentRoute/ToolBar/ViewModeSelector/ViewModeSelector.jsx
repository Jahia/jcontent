import React from 'react';
import {Button, ViewList, ViewTree, WebPage} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {useDispatch, useSelector} from 'react-redux';
import {setTableViewMode} from '../../ContentLayout/StructuredView/StructuredView.redux';
import {useCode} from '~/JContent/useCode';

const localStorage = window.localStorage;

const FLATLIST = JContentConstants.tableView.viewMode.FLAT;
const STRUCTUREDVIEW = JContentConstants.tableView.viewMode.STRUCTURED;
const VIEW = JContentConstants.pagesMode.VIEW;
const VIEW_DEVICE = JContentConstants.pagesMode.VIEW_DEVICE;

const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;

const buttons = [FLATLIST, STRUCTUREDVIEW];
const pagesButtons = [VIEW, VIEW_DEVICE];

const icons = {
    [FLATLIST]: <ViewList/>,
    [STRUCTUREDVIEW]: <ViewTree/>,
    [VIEW]: <WebPage/>,
    [VIEW_DEVICE]: <WebPage/>
};

const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

export const ViewModeSelector = () => {
    const {t} = useTranslation();
    const valid = useCode(code);

    let {mode, viewMode} = useSelector(state => ({
        mode: state.jcontent.mode,
        viewMode: state.jcontent.tableView.viewMode
    }));

    const dispatch = useDispatch();
    const onChange = vm => dispatch(setTableViewMode(vm));

    const handleChange = selectedViewMode => {
        onChange(selectedViewMode);
        localStorage.setItem(VIEW_MODE, selectedViewMode);
    };

    const allButtons = (mode === JContentConstants.mode.PAGES && valid) ? [...buttons, ...pagesButtons] : buttons;

    return (
        allButtons.map(v => (
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

export default ViewModeSelector;
