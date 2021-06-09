import React from 'react';
import PropTypes from 'prop-types';
import {useKeyboardNavigation} from '../useKeyboardNavigation';
import css from './ContentListTableMoon.scss';

/* eslint-disable no-unused-vars */

const ContentListTableWrapper = ({rows = [], children, onPreviewSelect = () => {}}) => {
    const {
        mainPanelRef,
        handleKeyboardNavigation,
        setFocusOnMainContainer,
        setSelectedItemIndex
    } = useKeyboardNavigation({
        listLength: rows.length,
        onSelectionChange: index => onPreviewSelect(rows[index].path)
    });

    return (
        <div ref={mainPanelRef}
             className={css.tableWrapper}
             tabIndex="1"
             onKeyDown={handleKeyboardNavigation}
             onClick={setFocusOnMainContainer}
        >
            {children}
        </div>
    );
};

ContentListTableWrapper.propTypes = {
    rows: PropTypes.array,
    children: PropTypes.node,
    onPreviewSelect: PropTypes.func
};

export default ContentListTableWrapper;
