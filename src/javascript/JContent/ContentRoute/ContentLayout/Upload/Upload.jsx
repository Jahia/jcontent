import React, {useEffect, useMemo} from 'react';
import {Snackbar} from '@material-ui/core';
import {Button, Close} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {uploadsStatuses, uploadStatuses} from './Upload.constants';
import {fileuploadSetUploads} from './Upload.redux';
import UploadItem from './UploadItem';
import UploadHeader from './UploadHeader';
import styles from './Upload.scss';
import PropTypes from 'prop-types';

const SNACKBAR_CLOSE_TIMEOUT = 8000;

export const Upload = ({uploadUpdateCallback}) => {
    const dispatch = useDispatch();
    const {uploads} = useSelector(state => ({
        uploads: state.jcontent.fileUpload.uploads
    }), shallowEqual);

    const uploadStatus = useMemo(() => {
        const uploadStatus = {
            uploading: 0,
            uploaded: 0,
            error: 0,
            total: uploads.length,
            state: uploadsStatuses.NOT_STARTED
        };

        if (uploads.length > 0) {
            uploads.forEach(upload => {
                switch (upload.status) {
                    case uploadStatuses.UPLOADED:
                        uploadStatus.uploaded += 1;
                        break;
                    case uploadStatuses.HAS_ERROR:
                        uploadStatus.error += 1;
                        break;
                    default:
                        uploadStatus.uploading += 1;
                }

                if (upload.type === 'import') {
                    uploadStatus.type = 'import';
                }
            });

            if (uploadStatus.uploading > 0) {
                uploadStatus.state = uploadsStatuses.UPLOADING;
            } else if (uploadStatus.error > 0) {
                uploadStatus.state = uploadsStatuses.HAS_ERROR;
            } else {
                uploadStatus.state = uploadsStatuses.UPLOADED;
            }
        }

        return uploadStatus;
    }, [uploads]);

    useEffect(() => {
        if (uploadUpdateCallback) {
            uploadUpdateCallback(uploadStatus);
        }

        if (uploadStatus && uploadStatus.error === 0 && uploadStatus.uploading === 0 && uploadStatus.uploaded > 0) {
            setTimeout(() => {
                dispatch(fileuploadSetUploads([]));
            }, SNACKBAR_CLOSE_TIMEOUT);
        }
    }, [uploadUpdateCallback, uploadStatus, dispatch]);

    return (
        <Snackbar open={uploads.length > 0} classes={{root: styles.snackBar}}>
            <React.Fragment>
                <UploadHeader status={uploadStatus}/>
                <div className={styles.snackBarScroll}>
                    {uploads.map((upload, index) => (
                        <UploadItem key={upload.id} index={index} upload={upload}/>
                    ))}
                </div>
                <Button isReversed
                        variant="ghost"
                        size="small"
                        data-cm-role="upload-close-button"
                        icon={<Close/>}
                        className={styles.closeButton}
                        onClick={() => dispatch(fileuploadSetUploads([]))}
                />
            </React.Fragment>
        </Snackbar>
    );
};

Upload.propTypes = {
    uploadUpdateCallback: PropTypes.func.isRequired
};

export default Upload;
