import React from 'react';
import PropTypes from 'prop-types';
import {uploadStatuses} from '../../Upload.constants';
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
        if (error === 'WRONG_INPUT') {
            return <DontUploadButton upload={upload} index={index}/>;
        }

        if (error === 'FILE_EXISTS') {
            return (
                <>
                    <RenameButton showRenameDialog={showRenameDialog}/>
                    <OverwriteButton doUploadAndStatusUpdate={doUploadAndStatusUpdate}/>
                    <DontUploadButton upload={upload} index={index}/>
                </>
            );
        }

        if (error === 'FILE_NAME_SIZE' || error === 'FILE_NAME_INVALID') {
            return (
                <>
                    <RenameButton upload={upload} showRenameDialog={showRenameDialog}/>
                    <DontUploadButton upload={upload} index={index}/>
                </>
            );
        }

        if (error === 'FOLDER_CONFLICT' || error === 'FOLDER_FILE_NAME_SIZE' || error === 'FOLDER_FILE_NAME_INVALID') {
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
