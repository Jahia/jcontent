import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';

const Frame = forwardRef(function (props, ref) {
    const iFrameOnLoad = () => {
        console.log('Loaded');
    };

    return (
        <iframe ref={ref}
                width="100%"
                height="100%"
                onLoad={iFrameOnLoad}
        />
    );
});

Frame.propTypes = {
};

export default Frame;
