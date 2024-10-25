import React, {forwardRef} from 'react';

const Frame = forwardRef(function (props, ref) {
    return (
        <iframe ref={ref}
                width="100%"
                height="100%"
        />
    );
});

Frame.propTypes = {
};

export default Frame;
