import React from 'react';
import PropTypes from 'prop-types';
import css from './ContentListTableMoon.scss';

const ContentListTableWrapper = ({children, ...rest}) => {
    return (
        <div className={css.tableWrapper}
             tabIndex="1"
             {...rest}
        >
            {children}
        </div>
    );
};

ContentListTableWrapper.propTypes = {
    children: PropTypes.node
};

export default ContentListTableWrapper;
