import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';

const Frame = forwardRef(function ({role}, ref) {
    return (
        <iframe ref={ref}
                data-sel-role={role}
                width="100%"
                height="100%"
        />
    );
});

Frame.propTypes = {
    role: PropTypes.string
};

export default Frame;
