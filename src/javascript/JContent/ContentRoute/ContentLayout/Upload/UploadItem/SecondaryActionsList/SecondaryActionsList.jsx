import React from 'react';
import PropTypes from 'prop-types';
import {uploadErrors, uploadStatuses} from '../../Upload.constants';
import DontUploadButton from './DontUploadButton';
import OverwriteButton from './OverwriteButton';
import RenameButton from './RenameButton';
import RetryButton from './RetryButton';

const SecondaryActionsList = ({upload, index, doUploadAndStatusUpdate, showRenameDialog}) => {
    const {status, error} = upload;

    if (status === uploadStatuses.QUEUED) {
        return <DontUploadButton upload={upload} index={index}/>;
    }

    if (status === uploadStatuses.HAS_ERROR) {
        if (error.type === uploadErrors.WRONG_INPUT) {
            return <DontUploadButton upload={upload} index={index}/>;
        }

        if (error.type === uploadErrors.FILE_EXISTS) {
            return (
                <>
                    <RenameButton showRenameDialog={showRenameDialog}/>
                    <OverwriteButton doUploadAndStatusUpdate={doUploadAndStatusUpdate}/>
                    <DontUploadButton upload={upload} index={index}/>
                </>
            );
        }

        if ([uploadErrors.FILE_NAME_SIZE, uploadErrors.FILE_NAME_INVALID].includes(error.type)) {
            return (
                <>
                    <RenameButton upload={upload} showRenameDialog={showRenameDialog}/>
                    <DontUploadButton upload={upload} index={index}/>
                </>
            );
        }

        if ([uploadErrors.FOLDER_CONFLICT, uploadErrors.FOLDER_FILE_NAME_SIZE, uploadErrors.FOLDER_FILE_NAME_INVALID].includes(error.type)) {
            return (
                <>
                    <RenameButton upload={upload} showRenameDialog={showRenameDialog}/>
                    <DontUploadButton upload={upload} index={index}/>
                </>
            );
        }

        return (
            <>
                <DontUploadButton upload={upload} index={index}/>
                <RetryButton doUploadAndStatusUpdate={doUploadAndStatusUpdate}/>
            </>
        );
    }

    return null;
};

SecondaryActionsList.propTypes = {
    index: PropTypes.number,
    upload: PropTypes.object,
    doUploadAndStatusUpdate: PropTypes.func,
    showRenameDialog: PropTypes.func
};

export default SecondaryActionsList;
