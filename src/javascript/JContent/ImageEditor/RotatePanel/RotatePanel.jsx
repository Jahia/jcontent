import React from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from '@material-ui/core';
import {ArrowLeft, ArrowRight, Button, Typography} from '@jahia/moonstone';
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
                <Tooltip title={t('jcontent:label.contentManager.editImage.rotateLeft')}>
                    <Button data-cm-role="rotate-left"
                            size="big"
                            variant="ghost"
                            icon={<ArrowLeft/>}
                            onClick={() => onRotate(-1)}/>
                </Tooltip>
                <Tooltip title={t('jcontent:label.contentManager.editImage.rotateRight')}>
                    <Button data-cm-role="rotate-right"
                            size="big"
                            variant="ghost"
                            icon={<ArrowRight/>}
                            onClick={() => onRotate(1)}/>
                </Tooltip>
            </div>
        </>
    );
};

RotatePanel.propTypes = {
    onRotate: PropTypes.func.isRequired
};

export default RotatePanel;
