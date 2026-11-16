import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer} from '~/utils/getButtonRenderer';

export const BULK_ACTIONS_MENU = 'bulkActionsMenu';
export const BULK_ACTIONS_TARGET = 'bulkActions';

const DEFAULT_BUTTON_PROPS = {size: 'default', variant: 'ghost'};

/**
 * The "Bulk" menu of a selection: one button opening the actions registered in a target.
 *
 * Any prop other than the ones documented below is handed to every entry of the menu, on top of
 * `path` (one item selected) or `paths` (several).
 */
export const BulkActionsMenu = ({paths = [], menuTarget = BULK_ACTIONS_TARGET, actionKeys, menuFilter, buttonProps, ...others}) => {
    const selection = useMemo(() => (paths.length === 1 ? {path: paths[0]} : {paths}), [paths]);
    const mergedButtonProps = useMemo(() => ({...DEFAULT_BUTTON_PROPS, ...buttonProps}), [buttonProps]);
    const filter = useMemo(() => {
        if (!actionKeys) {
            return menuFilter;
        }

        return action => actionKeys.includes(action.key) && (!menuFilter || menuFilter(action));
    }, [actionKeys, menuFilter]);

    if (paths.length === 0) {
        return null;
    }

    return (
        <DisplayAction
            isMenuPreload
            menuUseElementAnchor
            {...others}
            {...selection}
            actionKey={BULK_ACTIONS_MENU}
            menuTarget={menuTarget}
            menuFilter={filter}
            buttonProps={mergedButtonProps}
            render={ButtonRenderer}
        />
    );
};

BulkActionsMenu.propTypes = {
    /** Paths of the selected nodes; nothing is rendered when empty */
    paths: PropTypes.arrayOf(PropTypes.string),
    /** Registry target(s) the entries of the menu are read from */
    menuTarget: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    /** Keys of the registered actions to show; all of the target's actions when omitted */
    actionKeys: PropTypes.arrayOf(PropTypes.string),
    /** Keeps only the registered actions it returns true for */
    menuFilter: PropTypes.func,
    /** Props of the button opening the menu */
    buttonProps: PropTypes.object
};

export default BulkActionsMenu;
