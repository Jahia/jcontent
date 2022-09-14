import React from 'react';
import PropTypes from 'prop-types';
import {FormControl, Input, InputLabel} from '@material-ui/core';
import {Button, Link, Typography} from '@jahia/moonstone';
import styles from './CropPanel.scss';
import {useTranslation} from 'react-i18next';

export const CropPanel = ({originalWidth, originalHeight, cropParams, onCrop}) => {
    const {t} = useTranslation('jcontent');
    const setWidth = event => {
        let width = event.target.value;

        if (event.target.checkValidity()) {
            onCrop({width: Math.floor(Math.min(width, originalWidth))});
        } else {
            onCrop({width: cropParams.width});
        }
    };

    const setHeight = event => {
        let height = event.target.value;

        if (event.target.checkValidity()) {
            onCrop({height: Math.floor(Math.min(height, originalHeight))});
        } else {
            onCrop({height: cropParams.height});
        }
    };

    const switchRatio = () => {
        onCrop({aspect: !cropParams.aspect});
    };

    return (
        <>
            <Typography variant="subheading">
                {t('jcontent:label.contentManager.editImage.cropInfo')}
            </Typography>
            <div className={styles.form}>
                <div className={styles.firstCol}>
                    <FormControl className={styles.formControl}>
                        <InputLabel shrink
                                    className={styles.inputLabel}
                        >{t('jcontent:label.contentManager.editImage.width')}
                        </InputLabel>
                        <Input
                            id="width-field"
                            value={cropParams.width ? Math.round(cropParams.width) : ''}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                </div>
                <div className={styles.secondCol}>
                    <Button icon={<Link/>}
                            color={cropParams.aspect ? 'accent' : 'default'}
                            size="big"
                            variant="ghost"
                            data-cm-role="keep-ratio-button"
                            onClick={switchRatio}
                    />
                </div>
                <div className={styles.firstCol}>
                    <FormControl className={styles.formControl}>
                        <InputLabel shrink
                                    className={styles.inputLabel}
                        >{t('jcontent:label.contentManager.editImage.height')}
                        </InputLabel>
                        <Input
                            id="height-field"
                            value={cropParams.height ? Math.round(cropParams.height) : ''}
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

CropPanel.propTypes = {
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    cropParams: PropTypes.object,
    onCrop: PropTypes.func.isRequired
};

export default CropPanel;
