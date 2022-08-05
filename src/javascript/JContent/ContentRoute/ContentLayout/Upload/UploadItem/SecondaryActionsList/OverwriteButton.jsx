import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';
import {useTranslation} from 'react-i18next';

const OverwriteButton = ({doUploadAndStatusUpdate}) => {
    const {t} = useTranslation('jcontent');
    return (
        <Button
            key="overwrite"
            isReversed
            size="big"
            className={styles.actionButton}
            component="a"
            variant="ghost"
            label={t('jcontent:label.contentManager.fileUpload.replace')}
            onClick={() => {
                doUploadAndStatusUpdate('replace');
            }}
        />
    );
};

OverwriteButton.propTypes = {
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default OverwriteButton;
