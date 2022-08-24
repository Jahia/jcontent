import React from 'react';
import PropTypes from 'prop-types';
import {FormControl, Input, InputLabel} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {Button, Link, Typography} from '@jahia/moonstone';
import styles from './ResizePanel.scss';

export const ResizePanel = ({originalWidth, originalHeight, resizeParams, onResize}) => {
    const {t} = useTranslation('jcontent');

    const setWidth = event => {
        let value = event.target.value;

        if (event.target.checkValidity()) {
            onResize({width: Math.floor(Math.min(value, originalWidth))});
        } else {
            onResize({width: resizeParams.width});
        }
    };

    const setHeight = event => {
        let value = event.target.value;

        if (event.target.checkValidity()) {
            onResize({height: Math.floor(Math.min(value, originalHeight))});
        } else {
            onResize({height: resizeParams.height});
        }
    };

    const switchRatio = () => {
        onResize({keepRatio: !resizeParams.keepRatio});
    };

    return (
        <>
            <Typography variant="subheading">
                {t('jcontent:label.contentManager.editImage.resizeInfo')}
            </Typography>
            <div className={styles.form}>
                <div className={styles.firstCol}>
                    <FormControl className={styles.formControl}>
                        <InputLabel shrink className={styles.inputLabel}>{t('jcontent:label.contentManager.editImage.width')}</InputLabel>
                        <Input
                            id="width-field"
                            value={resizeParams.width}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                </div>
                <div className={styles.secondCol}>
                    <Button icon={<Link/>}
                            color={resizeParams.keepRatio ? 'accent' : 'default'}
                            size="big"
                            variant="ghost"
                            data-cm-role="keep-ratio-button"
                            onClick={switchRatio}/>
                </div>
                <div className={styles.firstCol}>
                    <FormControl className={styles.formControl}>
                        <InputLabel shrink className={styles.inputLabel}>{t('jcontent:label.contentManager.editImage.height')}</InputLabel>
                        <Input
                            id="height-field"
                            value={resizeParams.height}
                            type="number"
                            margin="none"
                            onChange={setHeight}
                        />
                    </FormControl>
                </div>
            </div>
        </>
    );
};

ResizePanel.propTypes = {
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    resizeParams: PropTypes.object.isRequired,
    onResize: PropTypes.func.isRequired
};

export default ResizePanel;
