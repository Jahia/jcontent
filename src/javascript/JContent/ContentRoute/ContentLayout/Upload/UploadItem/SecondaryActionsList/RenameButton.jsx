import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/moonstone';
import styles from '../UploadItem.scss';
import {useTranslation} from 'react-i18next';

const RenameButton = ({showRenameDialog}) => {
    const {t} = useTranslation('jcontent');
    return (
        <Button
            key="rename"
            isReversed
            size="big"
            className={styles.actionButton}
            data-cm-role="upload-rename"
            component="a"
            variant="ghost"
            label={t('jcontent:label.contentManager.fileUpload.rename')}
            onClick={showRenameDialog}
        />
    );
};

RenameButton.propTypes = {
    showRenameDialog: PropTypes.func.isRequired
};

export default RenameButton;
