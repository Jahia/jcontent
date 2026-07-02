import React, {Suspense} from 'react';
import PropTypes from 'prop-types';
import {File} from '@jahia/moonstone';
import classNames from 'clsx';
import styles from './DocumentViewer.scss';

const FileViewer = React.lazy(() => import('react-file-viewer'));

export const DocumentViewer = ({isFullScreen = false, file, type}) => {
    const renderViewer = () => {
        switch (type) {
            case 'webm':
            case 'mp4':
                return <video controls src={file}><track kind="captions"/></video>;
            case 'mp3':
                return <audio controls src={file}><track kind="captions"/></audio>;
            // List of files compatible with react-file-viewer
            case 'docx':
            case 'xlsx':
            case 'csv':
                return (
                    <Suspense fallback={null}>
                        <FileViewer fileType={type} filePath={file}/>
                    </Suspense>
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
