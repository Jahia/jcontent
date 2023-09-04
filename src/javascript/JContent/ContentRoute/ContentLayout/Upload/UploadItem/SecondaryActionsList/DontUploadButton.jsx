import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {fileuploadRemoveUpload} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.redux';

const DontUploadButton = ({upload, index}) => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const {type} = upload;

    return (
        <Button
            key="dontupload"
            isReversed
            size="big"
            className={styles.actionButton}
            component="a"
            variant="ghost"
            label={type === 'import' ? t('jcontent:label.contentManager.fileUpload.dontImport') : t('jcontent:label.contentManager.fileUpload.dontUpload')}
            onClick={() => {
                dispatch(fileuploadRemoveUpload(index));
            }}
        />
    );
};

DontUploadButton.propTypes = {
    index: PropTypes.number,
    upload: PropTypes.object
};

export default DontUploadButton;
