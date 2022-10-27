import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, ViewList, ViewTree, Visibility, WebPage} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {setTableViewMode} from '~/JContent/redux/tableView.redux';
import classes from './ViewModeSelector.scss';
import {booleanValue} from '~/JContent/JContent.utils';

const localStorage = window.localStorage;

const FLATLIST = JContentConstants.tableView.viewMode.FLAT;
const STRUCTUREDVIEW = JContentConstants.tableView.viewMode.STRUCTURED;
const PAGE_COMPOSER = JContentConstants.tableView.viewMode.PAGE_COMPOSER;
const PREVIEW = JContentConstants.tableView.viewMode.PREVIEW;

const VIEW_MODE = JContentConstants.localStorageKeys.viewMode;

const icons = {
    [PAGE_COMPOSER]: <WebPage/>,
    [PREVIEW]: <Visibility/>,
    [FLATLIST]: <ViewList/>,
    [STRUCTUREDVIEW]: <ViewTree/>
};

const buttons = [FLATLIST, STRUCTUREDVIEW];
const pagesButtons = [PAGE_COMPOSER, PREVIEW, FLATLIST, STRUCTUREDVIEW];

const tableViewDropdownData = (t, viewMode, allButtons) => {
    return allButtons.map(v => ({
        label: t(`jcontent:label.contentManager.view.${v}`),
        value: v,
        iconStart: icons[v],
        attributes: {
            'aria-selected': viewMode === v,
            'data-sel-role': `sel-view-mode-${v}`
        }
    }));
};

export const ViewModeSelector = ({selector, setTableViewModeAction}) => {
    const {t} = useTranslation('jcontent');
    const valid = booleanValue(contextJsParameters.config.jcontent?.showPageComposer);

    let {mode, viewMode} = useSelector(selector, shallowEqual);

    const dispatch = useDispatch();
    const onChange = vm => dispatch(setTableViewModeAction(vm));

    const handleChange = selectedViewMode => {
        onChange(selectedViewMode);
        localStorage.setItem(VIEW_MODE, selectedViewMode);
    };

    const allButtons = (mode === JContentConstants.mode.PAGES && valid) ? pagesButtons : buttons;

    return (
        <>
            <Dropdown className={classes.dropdown}
                      data={tableViewDropdownData(t, viewMode, allButtons)}
                      data-sel-role="sel-view-mode-dropdown"
                      label={t(`jcontent:label.contentManager.view.${viewMode}`)}
                      value={viewMode}
                      icon={icons[viewMode]}
                      onChange={(e, item) => handleChange(item.value)}
            />
        </>
    );
};

const selector = state => ({
    mode: state.jcontent.mode,
    viewMode: state.jcontent.tableView.viewMode
});

ViewModeSelector.propTypes = {
    selector: PropTypes.func,
    setTableViewModeAction: PropTypes.func
};

ViewModeSelector.defaultProps = {
    selector: selector,
    setTableViewModeAction: mode => setTableViewMode(mode)
};

export default ViewModeSelector;
