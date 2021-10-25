import PropTypes from 'prop-types';
import * as React from 'react';

const SvgFileIcon = ({size, className, ...otherProps}) => {
    const props = Object.assign(
        {},
        {
            size,
            className,
            ...otherProps
        }
    );
    props.className = className + ' moonstone-icon moonstone-icon_' + size;
    return (
        <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
        >
            <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
        </svg>
    );
};

SvgFileIcon.defaultProps = {
    size: 'default',
    className: ''
};
SvgFileIcon.propTypes = {
    size: PropTypes.oneOf('small', 'big', 'default'),
    className: PropTypes.string
};
export default SvgFileIcon;
