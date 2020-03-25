import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {BreadcrumbItem, Menu, MenuItem} from '@jahia/moonstone';
import {MoreHoriz} from '@jahia/moonstone/dist/icons';

const CompositePathEntry = ({items, onItemClick}) => {
    const [isMenuDisplayed, setMenuDisplayed] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuContainerEl = useRef(null);

    const handleButtonClick = () => {
        setAnchorEl(menuContainerEl);
        setMenuDisplayed(!isMenuDisplayed);
    };

    const handleMenuClose = () => {
        setMenuDisplayed(false);
    };

    return (items.length > 0) &&
        <div ref={menuContainerEl}>
            <BreadcrumbItem icon={<MoreHoriz/>} onClick={handleButtonClick}/>
            <Menu isDisplayed={isMenuDisplayed}
                  anchorEl={anchorEl}
                  transformElOrigin={{vertical: 'top', horizontal: 'left'}}
                  onClose={handleMenuClose}
            >
                {items.map(item => <MenuItem key={item.uuid} label={item.displayName || item.uuid} onClick={() => onItemClick(item.path)}/>)}
            </Menu>
        </div>;
};

CompositePathEntry.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    onItemClick: PropTypes.func
};

CompositePathEntry.defaultProps = {
    onItemClick: () => {}
};

export default CompositePathEntry;
