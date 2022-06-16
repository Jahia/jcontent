import React from 'react';
import {Button, toIconComponentFunction, ViewList, ViewTree, WebPage, Dropdown} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {useDispatch, useSelector} from 'react-redux';
import {setTableViewMode} from '../../ContentLayout/StructuredView/StructuredView.redux';
import {useCode} from '~/JContent/useCode';
import classes from './ViewModeSelector.scss';

const localStorage = window.localStorage;

const FLATLIST = JContentConstants.tableView.viewMode.FLAT;
const STRUCTUREDVIEW = JContentConstants.tableView.viewMode.STRUCTURED;
const VIEW = JContentConstants.pagesMode.VIEW;
const VIEW_DEVICE = JContentConstants.pagesMode.VIEW_DEVICE;

const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;

const Phone = toIconComponentFunction(
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 27.442 27.442">
        <g>
            <path d="M19.494,0H7.948C6.843,0,5.951,0.896,5.951,1.999v23.446c0,1.102,0.892,1.997,1.997,1.997h11.546   c1.103,0,1.997-0.895,1.997-1.997V1.999C21.491,0.896,20.597,0,19.494,0z M10.872,1.214h5.7c0.144,0,0.261,0.215,0.261,0.481   s-0.117,0.482-0.261,0.482h-5.7c-0.145,0-0.26-0.216-0.26-0.482C10.612,1.429,10.727,1.214,10.872,1.214z M13.722,25.469   c-0.703,0-1.275-0.572-1.275-1.276s0.572-1.274,1.275-1.274c0.701,0,1.273,0.57,1.273,1.274S14.423,25.469,13.722,25.469z    M19.995,21.1H7.448V3.373h12.547V21.1z"/>
        </g>
    </svg>
);

const icons = {
    [FLATLIST]: <ViewList/>,
    [STRUCTUREDVIEW]: <ViewTree/>,
    [VIEW]: <WebPage/>,
    [VIEW_DEVICE]: <Phone/>
};

const tableViewModes = [FLATLIST, STRUCTUREDVIEW];
const pagesButtons = [VIEW, VIEW_DEVICE];

const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

const tableViewDropdownData = (t, viewMode) => {
    return tableViewModes.map(v => ({
        label: t(`jcontent:label.contentManager.view.${v}`),
        value: v,
        iconStart: icons[v],
        attributes: {
            'aria-selected': viewMode === v,
            'data-sel-role': `sel-view-mode-${v}`
        }
    }));
};

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

    const allButtons = (mode === JContentConstants.mode.PAGES && valid) ? pagesButtons : [];

    return (
        <>
            <Dropdown className={classes.dropdown}
                      data={tableViewDropdownData(t, viewMode)}
                      data-sel-role="sel-view-mode-dropdown"
                      label={t(`jcontent:label.contentManager.view.${viewMode}`)}
                      value={viewMode}
                      icon={icons[viewMode]}
                      onChange={(e, item) => handleChange(item.value)}
            />
            {
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
            }
        </>
    );
};

export default ViewModeSelector;
