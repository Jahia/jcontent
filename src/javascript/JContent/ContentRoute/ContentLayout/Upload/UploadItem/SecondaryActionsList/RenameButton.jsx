import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';

const RenameButton = ({t, showRenameDialog}) => (
    <Button
        key="rename"
        isReversed
        size="big"
        className={styles.actionButton}
        component="a"
        variant="ghost"
        label={t('jcontent:label.contentManager.fileUpload.rename')}
        onClick={showRenameDialog}
    />
);

RenameButton.propTypes = {
    t: PropTypes.func.isRequired,
    showRenameDialog: PropTypes.func.isRequired
};

export default RenameButton;
