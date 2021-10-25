import PropTypes from 'prop-types';
import * as React from 'react';

const SvgZipIcon = ({size, className, ...otherProps}) => {
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
            <path d="M4.01 4c0-1.1.89-2 1.99-2v2h2v2H6v2h2v2H6v2h2v2H6v5h4v-7H8v-2h2V8H8V6h2V4H8V2h6l6 6v12c0 1.1-.9 2-2 2H5.99C4.89 22 4 21.1 4 20l.01-16zM13 3.5V9h5.5L13 3.5z"/>
            <path d="M7 17v1h2v-1H7z"/>
        </svg>
    );
};

SvgZipIcon.defaultProps = {
    size: 'default',
    className: ''
};
SvgZipIcon.propTypes = {
    size: PropTypes.oneOf('small', 'big', 'default'),
    className: PropTypes.string
};
export default SvgZipIcon;
