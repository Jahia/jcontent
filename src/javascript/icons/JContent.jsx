import * as React from 'react';
import PropTypes from 'prop-types';

const SvgJContent = ({size, className, color, ...otherProps
}) => {
    const props = Object.assign(
        {},
        {
            size,
            className,
            ...otherProps
        }
    );
    const classNameColor = color ? ' moonstone-icon_' + color : '';
    props.className =
        className + ' moonstone-icon moonstone-icon_' + size + classNameColor;
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            {...props}
        >
            <path d="M15.8315 12.7809H13.6822V10.6316L20.021 4.29279L22.1703 6.44203L15.8315 12.7809ZM21.6831 2.63071C21.9066 2.40719 22.2677 2.40719 22.4912 2.63071L23.8324 3.97184C24.0559 4.19536 24.0559 4.55643 23.8324 4.77996L22.7835 5.82878L20.6343 3.67954L21.6831 2.63071ZM1.32346 12.7809C0.806078 12.7809 0.288696 13.2982 0.288696 13.8156V21.059C0.288696 21.6281 0.75434 22.0937 1.32346 22.0937H10.6363C11.1537 22.0937 11.6711 21.5763 11.6711 21.059V13.8156C11.6711 13.2982 11.1537 12.7809 10.6363 12.7809H1.32346ZM5.46251 19.2533L4.16906 17.696L2.35822 20.0242H9.60156L7.27335 16.9199L5.46251 19.2533ZM19 18V12.4407L21 10.4407V18C21 19.1 20.1 20 19 20H13.6711V18H19ZM5 7.99998H13.4854L17.4854 3.99998H5C3.89 3.99998 3 4.89998 3 5.99998V10.7809H5V7.99998Z"/>
        </svg>
    );
};

SvgJContent.propTypes = {
    size: PropTypes.string,
    className: PropTypes.string,
    color: PropTypes.string
};

export default SvgJContent;
