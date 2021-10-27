import React from 'react';
import PropTypes from 'prop-types';
import {FileIcon} from '@jahia/icons';
import classNames from 'clsx';
import styles from './DocumentViewer.scss';

const FileViewer = React.lazy(() => import('react-file-viewer'));

export const DocumentViewer = ({isFullScreen, file, type}) => {
    const renderViewer = () => {
        switch (type) {
            case 'docx':
            case 'doc':
                return <FileViewer fileType={type} filePath={file}/>;
            case 'avi':
            case 'mp4':
            case 'video':
                return <FileViewer fileType={type} filePath={file}/>;
            default:
                return (
                    <FileIcon filename={file} color="disabled" classes={{root: styles.icon}}/>
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
