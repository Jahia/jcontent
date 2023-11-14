import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, ViewList, ViewTree, WebPage} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {setTableViewMode} from '~/JContent/redux/JContent.redux';
import classes from './ViewModeSelector.scss';
import {booleanValue} from '~/JContent/JContent.utils';
import {TableViewModeChangeTracker} from './tableViewChangeTracker';
import {registry} from '@jahia/ui-extender';
import {useNodeInfo} from '@jahia/data-helper';

const FLATLIST = JContentConstants.tableView.viewMode.FLAT;
const STRUCTUREDVIEW = JContentConstants.tableView.viewMode.STRUCTURED;
const PAGE_BUILDER = JContentConstants.tableView.viewMode.PAGE_BUILDER;

const icons = {
    [PAGE_BUILDER]: <WebPage/>,
    [FLATLIST]: <ViewList/>,
    [STRUCTUREDVIEW]: <ViewTree/>
};

const defaultAvailableModes = [PAGE_BUILDER, FLATLIST, STRUCTUREDVIEW];

const tableViewDropdownData = (t, viewMode, allButtons, disabled) => {
    return allButtons.map(v => ({
        label: t(`jcontent:label.contentManager.view.${v}`),
        value: v,
        isDisabled: disabled.indexOf(v) !== -1,
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
    const info = useNodeInfo({path}, {getIsNodeTypes: ['jnt:page', 'jmix:mainResource']});

    const accordion = registry.get('accordionItem', mode);
    let availableModes = accordion?.tableConfig?.availableModes || defaultAvailableModes;

    if (!booleanValue(contextJsParameters.config.jcontent?.showPageBuilder)) {
        availableModes = availableModes.filter(n => n !== PAGE_BUILDER);
    }

    const disabledPageBuilder = info.node && !info.node['jnt:page'] && !info.node['jmix:mainResource'];
    const disabled = disabledPageBuilder ? [PAGE_BUILDER] : [];

    const onChange = vm => dispatch(setTableViewModeAction(vm));

    const handleChange = selectedViewMode => {
        TableViewModeChangeTracker.registerChange();
        onChange(selectedViewMode);
    };

    return (
        <Dropdown className={classes.dropdown}
                  size="small"
                  data={tableViewDropdownData(t, viewMode, availableModes, disabled)}
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
