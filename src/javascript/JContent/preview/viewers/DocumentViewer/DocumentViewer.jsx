import React from 'react';
import PropTypes from 'prop-types';
import {File} from '@jahia/moonstone';
import classNames from 'clsx';
import styles from './DocumentViewer.scss';

const FileViewer = React.lazy(() => import('react-file-viewer'));

export const DocumentViewer = ({isFullScreen, file, type}) => {
    const renderViewer = () => {
        switch (type) {
            // List of files compatible with react-file-viewer
            case 'docx':
            case 'xlsx':
            case 'csv':
            case 'mp4':
            case 'webm':
            case 'mp3':
                return (
                    <FileViewer fileType={type} filePath={file}/>
                );

            default:
                return (
                    <File className={classNames(styles.icon)}/>
                );
        }
    };

    return (
        <div className={classNames(styles.container, isFullScreen && styles.fullScreen)}>
            {renderViewer()}
        </div>
    );
};

DocumentViewer.propTypes = {
    file: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isFullScreen: PropTypes.bool
};

DocumentViewer.defaultProps = {
    isFullScreen: false
};

export default DocumentViewer;
