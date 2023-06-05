import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, ViewList, ViewTree, Visibility, WebPage} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {setTableViewMode} from '~/JContent/redux/tableView.redux';
import classes from './ViewModeSelector.scss';
import {booleanValue} from '~/JContent/JContent.utils';
import {useQuery} from '@apollo/client';
import {GetContentType} from './ViewModeSelector.gql-queries';
import {TableViewModeChangeTracker} from './tableViewChangeTracker';

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
    const dispatch = useDispatch();
    const {mode, viewMode, path} = useSelector(selector, shallowEqual);
    const {data, error, loading} = useQuery(GetContentType, {
        variables: {path: path},
        skip: !path // Skips if path is not defined
    });

    let showPCAndPreviewSelector = false;

    if (!loading && !error && data?.jcr?.node) {
        showPCAndPreviewSelector = mode === JContentConstants.mode.PAGES && booleanValue(contextJsParameters.config.jcontent?.showPageComposer) && data.jcr.node.isDisplayableNode;
    }

    const onChange = vm => dispatch(setTableViewModeAction(vm));

    const handleChange = selectedViewMode => {
        TableViewModeChangeTracker.registerChange();
        onChange(selectedViewMode);
        localStorage.setItem(VIEW_MODE, selectedViewMode);
    };

    const allButtons = showPCAndPreviewSelector ? pagesButtons : buttons;

    return (
        <Dropdown className={classes.dropdown}
                  size="small"
                  data={tableViewDropdownData(t, viewMode, allButtons)}
                  data-sel-role="sel-view-mode-dropdown"
                  label={t(`jcontent:label.contentManager.view.${viewMode}`)}
                  value={viewMode}
                  icon={icons[viewMode]}
                  onChange={(e, item) => handleChange(item.value)}
            />
    );
};

const selector = state => ({
    mode: state.jcontent.mode,
    viewMode: state.jcontent.tableView.viewMode,
    path: state.jcontent.path
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
