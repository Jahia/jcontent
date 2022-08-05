import React from 'react';
import PropTypes from 'prop-types';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {filesgridSetMode} from '../../ContentLayout/FilesGrid/FilesGrid.redux';
import JContentConstants from '~/JContent/JContent.constants';
import {Dropdown, ViewGrid, ViewList} from '@jahia/moonstone';
import classes from './FileModeSelector.scss';

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

export const FileModeSelector = ({selector, setModeAction}) => {
    const {t} = useTranslation('jcontent');

    const {mode} = useSelector(selector, shallowEqual);

    const dispatch = useDispatch();
    const onChange = mode => dispatch(setModeAction(mode));

    const handleChange = selectedMode => {
        onChange(selectedMode);
        localStorage.setItem(FILE_SELECTOR_MODE, selectedMode);
    };

    return (
        <Dropdown className={classes.dropdown}
                  data={tableViewDropdownData(t, mode)}
                  data-sel-role="sel-view-mode-dropdown"
                  label={t(`jcontent:label.contentManager.filesGrid.${mode}`)}
                  value={mode}
                  icon={icons[mode]}
                  onChange={(e, item) => handleChange(item.value)}
        />
    );
};

const selector = state => ({
    mode: state.jcontent.filesGrid.mode
});

FileModeSelector.propTypes = {
    selector: PropTypes.func,
    setModeAction: PropTypes.func
};

FileModeSelector.defaultProps = {
    selector: selector,
    setModeAction: mode => filesgridSetMode(mode)
};

export default FileModeSelector;

