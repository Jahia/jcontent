import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer} from '~/utils/getButtonRenderer';

export const BULK_ACTIONS_MENU = 'bulkActionsMenu';
export const BULK_ACTIONS_TARGET = 'bulkActions';

const DEFAULT_BUTTON_PROPS = {size: 'default', variant: 'ghost'};

/**
 * The "Bulk" menu of a selection: one button opening the actions registered in the bulkActions target.
 *
 * Any prop other than the ones documented below is handed to every entry of the menu, on top of
 * `path` (one item selected) or `paths` (several).
 */
export const BulkActionsMenu = ({paths = [], buttonProps, ...others}) => {
    const selection = useMemo(() => (paths.length === 1 ? {path: paths[0]} : {paths}), [paths]);
    const mergedButtonProps = useMemo(() => ({...DEFAULT_BUTTON_PROPS, ...buttonProps}), [buttonProps]);

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
            buttonProps={mergedButtonProps}
            render={ButtonRenderer}
        />
    );
};

BulkActionsMenu.propTypes = {
    /** Paths of the selected nodes; nothing is rendered when empty */
    paths: PropTypes.arrayOf(PropTypes.string),
    /** Props of the button opening the menu */
    buttonProps: PropTypes.object
};

export default BulkActionsMenu;
