import React from 'react';
import PropTypes from 'prop-types';
import css from './ContentTable.scss';

const ContentTableWrapper = ({children, reference, onClick = () => {}, onKeyDown = () => {}}) => {
    return (
        <div ref={reference}
             className={css.tableWrapper}
             tabIndex="1"
             onClick={onClick}
             onKeyDown={onKeyDown}
        >
            {children}
        </div>
    );
};

ContentTableWrapper.propTypes = {
    children: PropTypes.node,
    reference: PropTypes.object,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func
};

export default ContentTableWrapper;
