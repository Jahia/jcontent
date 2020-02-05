import React from 'react';
import PropTypes from 'prop-types';

export const MenuRenderer = ({isSubMenu, anchor, isOpen, onClose, onExited, onMouseEnter, onMouseLeave, children}) => {
    const outsideBottom = (anchor.top + (isSubMenu ? 100 : 300)) > window.document.body.clientHeight;
    const top = outsideBottom ? {bottom: 0} : {top: anchor.top};
    const outsideRight = (anchor.left + 150) > window.document.body.clientWidth;
    const left = outsideRight ? {right: 0} : {left: anchor.left};

    return (
        <>
            {
                !isSubMenu &&
                <div style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    top: 0,
                    left: 0,
                    opacity: isOpen ? 0.1 : 0,
                    transition: 'opacity 0.2s',
                    zIndex: 2000,
                    backgroundColor: 'black'
                }}
                     onClick={onClose}
                />
            }
            <div style={{
                position: 'fixed',
                ...top,
                ...left,
                borderRadius: '2px',
                boxShadow: '0px 4px 8px rgba(19, 28, 33, 0.2)',
                backgroundColor: '#FDFDFD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.2s',
                zIndex: 2100
            }}
                 onMouseEnter={onMouseEnter}
                 onMouseLeave={onMouseLeave}
                 onTransitionEnd={() => !isOpen && onExited()}
            >
                <div style={{flex: '0 1 auto'}} data-sel-role="cmm-context-menu">
                    {children}
                </div>
            </div>
        </>
    );
};

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
     * Where to display the menu ( object of shape `{ left: number, top:number}`)
     */
    anchor: PropTypes.object.isRequired,

    /**
     * Function to call when the menu has been completely closed,
     */
    onExited: PropTypes.func.isRequired,

    /**
     * Function to call when the menu is hovered,
     */
    onMouseEnter: PropTypes.func.isRequired,

    /**
     * Function to call when the menu is left
     */
    onMouseLeave: PropTypes.func.isRequired,

    /**
     * Function to call to close the menu
     */
    onClose: PropTypes.func.isRequired,
    /**
     *  Menu items
     */
    children: PropTypes.node.isRequired
};
