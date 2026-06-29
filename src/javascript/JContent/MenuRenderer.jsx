import React from 'react';
import PropTypes from 'prop-types';
import {Menu} from '@jahia/moonstone';
import {MenuLoadingContext, useMenuLoadingDelay} from './MenuLoadingContext';

export const MenuRenderer = ({isSubMenu, anchor, isOpen, isLoading, onClose, onExited, onMouseEnter, onMouseLeave, children, menuKey, ...otherProps}) => {
    const {showMenu, effectiveLoading} = useMenuLoadingDelay(isOpen, isLoading);

    return (
        <Menu
            {...anchor}
            data-sel-role={'jcontent-' + menuKey}
            style={{zIndex: isSubMenu ? 9001 : 9000}}
            hasOverlay={showMenu && !isSubMenu}
            isDisplayed={showMenu}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClose={onClose}
            onExited={onExited}
            {...otherProps}
        >
            <MenuLoadingContext.Provider value={effectiveLoading}>
                {children}
            </MenuLoadingContext.Provider>
        </Menu>
    );
};

MenuRenderer.propTypes = {
    /**
     * Menu id
     */
    menuKey: PropTypes.string.isRequired,

    /**
     * Is the menu to display a submenu of another menu
     */
    isSubMenu: PropTypes.bool.isRequired,

    /**
     * Is the menu open
     */
    isOpen: PropTypes.bool.isRequired,

    /**
     * Is the menu loading
     */
    isLoading: PropTypes.bool.isRequired,

    /**
     * Where to display the menu ( object of shape `{ left: number, top:number}`)
     */
    anchor: PropTypes.object.isRequired,

    /**
     * Function to call when the menu has been completely closed,
     */
    onExited: PropTypes.func,

    /**
     * Function to call when the menu is hovered,
     */
    onMouseEnter: PropTypes.func,

    /**
     * Function to call when the menu is left
     */
    onMouseLeave: PropTypes.func,

    /**
     * Function to call to close the menu
     */
    onClose: PropTypes.func.isRequired,
    /**
     *  Menu items
     */
    children: PropTypes.node.isRequired,
    /**
     * Context
     */
    context: PropTypes.object
};
