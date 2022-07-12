import React from 'react';
import PropTypes from 'prop-types';
import {Button, RotateLeft, RotateRight, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from './RotatePanel.scss';

export const RotatePanel = ({onRotate}) => {
    const {t} = useTranslation();
    return (
        <>
            <Typography variant="subheading">
                {t('jcontent:label.contentManager.editImage.rotateInfo')}
            </Typography>
            <div className={styles.icons}>
                <Button data-cm-role="rotate-left"
                        size="big"
                        variant="outlined"
                        label={t('jcontent:label.contentManager.editImage.rotateLeft')}
                        icon={<RotateLeft/>}
                        onClick={() => onRotate(-1)}/>
                <Button data-cm-role="rotate-right"
                        size="big"
                        variant="outlined"
                        label={t('jcontent:label.contentManager.editImage.rotateRight')}
                        icon={<RotateRight/>}
                        onClick={() => onRotate(1)}/>
            </div>
        </>
    );
};

RotatePanel.propTypes = {
    onRotate: PropTypes.func.isRequired
};

export default RotatePanel;
