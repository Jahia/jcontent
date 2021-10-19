import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';

const OverwriteButton = ({t, doUploadAndStatusUpdate}) => (
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

OverwriteButton.propTypes = {
    t: PropTypes.func.isRequired,
    doUploadAndStatusUpdate: PropTypes.func.isRequired
};

export default OverwriteButton;
