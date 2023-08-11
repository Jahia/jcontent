import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Dropdown, ViewList, ViewTree, WebPage} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {setTableViewMode} from '~/JContent/redux/JContent.redux';
import classes from './ViewModeSelector.scss';
import {booleanValue} from '~/JContent/JContent.utils';
import {useQuery} from '@apollo/client';
import {GetContentType} from './ViewModeSelector.gql-queries';
import {TableViewModeChangeTracker} from './tableViewChangeTracker';
import {registry} from '@jahia/ui-extender';

const FLATLIST = JContentConstants.tableView.viewMode.FLAT;
const STRUCTUREDVIEW = JContentConstants.tableView.viewMode.STRUCTURED;
const PAGE_BUILDER = JContentConstants.tableView.viewMode.PAGE_BUILDER;

const icons = {
    [PAGE_BUILDER]: <WebPage/>,
    [FLATLIST]: <ViewList/>,
    [STRUCTUREDVIEW]: <ViewTree/>
};

const defaultAvailableModes = [FLATLIST, STRUCTUREDVIEW];

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

    const accordion = registry.get('accordionItem', mode);
    let availableModes = accordion?.tableConfig?.availableModes || defaultAvailableModes;

    if (!booleanValue(contextJsParameters.config.jcontent?.showPageBuilder)) {
        availableModes = availableModes.filter(n => n !== PAGE_BUILDER);
    }

    const {data, loading} = useQuery(GetContentType, {
        variables: {path: path},
        skip: !path || availableModes.indexOf(PAGE_BUILDER) === -1
    });

    if (loading) {
        availableModes = [];
    } else if (data?.jcr?.node && !data.jcr.node.isDisplayableNode) {
        availableModes = availableModes.filter(n => n !== PAGE_BUILDER);
    }

    const onChange = vm => dispatch(setTableViewModeAction(vm));

    const handleChange = selectedViewMode => {
        TableViewModeChangeTracker.registerChange();
        onChange(selectedViewMode);
    };

    useEffect(() => {
        if (!loading && availableModes.indexOf(viewMode) === -1 && availableModes.length > 0) {
            onChange(availableModes[0]);
        }
    });

    return (
        <Dropdown className={classes.dropdown}
                  size="small"
                  data={tableViewDropdownData(t, viewMode, availableModes)}
                  data-sel-role="sel-view-mode-dropdown"
                  label={viewMode && t(`jcontent:label.contentManager.view.${viewMode}`)}
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
