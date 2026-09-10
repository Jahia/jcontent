import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './ImageViewer.scss';

export const ImageViewer = ({file, alt = '', isFullScreen = false, className = ''}) => {
    return (
        <div className={clsx(styles.container, className, isFullScreen && styles.fullScreen)}>
            <img
                className={styles.image}
                src={file}
                alt={alt}
                data-cm-role="preview-image"
            />
        </div>
    );
};

ImageViewer.propTypes = {
    file: PropTypes.string.isRequired,
    alt: PropTypes.string,
    isFullScreen: PropTypes.bool,
    className: PropTypes.string
};
