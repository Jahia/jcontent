import React from 'react';
import PropTypes from 'prop-types';
import {uploadStatuses} from '../../Upload.constants';
import DontUploadButton from './DontUploadButton';
import OverwriteButton from './OverwriteButton';
import RenameButton from './RenameButton';
import RetryButton from './RetryButton';

const SecondaryActionsList = props => {
    const {status, error} = props;

    if (status === uploadStatuses.QUEUED) {
        return <DontUploadButton {...props}/>;
    }

    if (status === uploadStatuses.HAS_ERROR) {
        if (error === 'WRONG_INPUT') {
            return <DontUploadButton {...props}/>;
        }

        if (error === 'FILE_EXISTS') {
            return (
                <>
                    <RenameButton {...props}/>
                    <OverwriteButton {...props}/>
                    <DontUploadButton {...props}/>
                </>
            );
        }

        if (error === 'FILE_NAME_SIZE' || error === 'FILE_NAME_INVALID') {
            return (
                <>
                    <RenameButton {...props}/>
                    <DontUploadButton {...props}/>
                </>
            );
        }

        if (error === 'INVALID_FOLDER_NAME') {
            return (
                <>
                    <RenameButton {...props}/>
                    <DontUploadButton {...props}/>
                </>
            );
        }

        if (error === 'FOLDER_EXISTS') {
            return (
                <DontUploadButton {...props}/>
            );
        }

        return (
            <>
                <DontUploadButton {...props}/>
                <RetryButton {...props}/>
            </>
        );
    }

    return null;
};

SecondaryActionsList.propTypes = {
    status: PropTypes.string,
    error: PropTypes.string
};

export default SecondaryActionsList;
