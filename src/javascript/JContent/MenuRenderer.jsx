import React from 'react';
import PropTypes from 'prop-types';
import {Menu} from '@jahia/moonstone';

export const MenuRenderer = ({isSubMenu, anchor, isOpen, isLoading, onClose, onExited, onMouseEnter, onMouseLeave, children}) => (
    <Menu
        {...anchor}
        style={{zIndex: isSubMenu ? 9001 : 9000}}
        hasOverlay={isOpen && !isLoading && !isSubMenu}
        isDisplayed={isOpen && !isLoading}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClose={onClose}
        onExited={onExited}
    >
        {children}
    </Menu>
);

MenuRenderer.propTypes = {
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
    children: PropTypes.node.isRequired
};
