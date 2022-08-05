import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';
import {useTranslation} from 'react-i18next';

const DontUploadButton = ({index, removeUploadFromQueue, updateUploadsStatus, type}) => {
    const {t} = useTranslation('jcontent');
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
                removeUploadFromQueue(index);
                updateUploadsStatus();
            }}
        />
    );
};

DontUploadButton.propTypes = {
    updateUploadsStatus: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeUploadFromQueue: PropTypes.func.isRequired,
    type: PropTypes.string
};

export default DontUploadButton;
