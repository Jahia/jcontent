import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import css from './ContentTable.scss';

const ContentTableWrapper = ({children, reference, dropReference, uploadType, onClick = () => {}, onKeyDown = () => {}, isCanDrop, ...rest}) => {
    return (
        <div ref={reference}
             className={clsx(css.tableWrapper, 'flexFluid')}
             tabIndex="1"
             onClick={onClick}
             onKeyDown={onKeyDown}
             {...rest}
        >
            {children}
        </div>
    );
};

ContentTableWrapper.propTypes = {
    children: PropTypes.node,
    reference: PropTypes.object,
    dropReference: PropTypes.object,
    uploadType: PropTypes.string,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    isCanDrop: PropTypes.bool
};

export default ContentTableWrapper;
