import React from 'react';
import PropTypes from 'prop-types';
import styles from './ViewportFrame.scss';

/**
 * Clips a preview rendered at a full viewport width down to the pane it sits in.
 *
 * @param {object} props - component props
 * @returns {JSX.Element} - the scaled frame
 */
export const ViewportFrame = ({frameRef, frameSize, scale, viewportWidth, children}) => (
    <div ref={frameRef} className={styles.frame} data-sel-role="preview-viewport-frame">
        <div
            className={styles.viewport}
            style={{
                width: `${viewportWidth}px`,
                // Undo the scale so the shrunken result still fills the pane vertically.
                height: frameSize ? `${frameSize.height / scale}px` : '100%',
                transform: `scale(${scale})`
            }}
        >
            {children}
        </div>
    </div>
);

ViewportFrame.propTypes = {
    frameRef: PropTypes.func.isRequired,
    frameSize: PropTypes.object,
    scale: PropTypes.number.isRequired,
    viewportWidth: PropTypes.number.isRequired,
    children: PropTypes.node
};
