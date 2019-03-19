import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FormControl, Input, InputLabel, withStyles} from '@material-ui/core';
import {IconButton, Typography} from '@jahia/ds-mui-theme';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Link} from 'mdi-material-ui';

let styles = theme => ({
    form: {
        display: 'flex',
        flexDirection: 'row',
        paddingTop: theme.spacing.unit * 3
    },
    firstCol: {
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column'
    },
    secondCol: {
        flex: '1 1 0%',
        alignSelf: 'center',
        justifySelf: 'start',
        padding: '16px'
    },
    formControl: {
        width: '100%',
        padding: '16px 0'
    },
    inputLabel: {
        color: theme.palette.font.alpha
    }
});

export const CropPanel = ({classes, t, originalWidth, originalHeight, cropParams, crop, width, height, onCropChange}) => {
    const [keepRatio, setKeepRatio] = useState(true);

    const setWidth = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            const widthValue = value > originalWidth ? originalWidth : Math.round(value);
            const heightValue = Math.round(keepRatio && originalHeight && originalWidth ? value * originalHeight / originalWidth : (height || originalHeight));
            crop({
                width: widthValue,
                height: heightValue,
                top: Math.round(cropParams.y * originalHeight / 100),
                left: Math.round(cropParams.x * originalWidth / 100)
            });
            onCropChange({
                width: widthValue * 100 / originalWidth,
                height: heightValue * 100 / originalHeight
            });
        }
    };

    const setHeight = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            const widthValue = Math.round(keepRatio && originalHeight && originalWidth ? value * originalWidth / originalHeight : (width || originalWidth));
            const heightValue = value > originalHeight ? originalHeight : Math.round(value);
            crop({
                width: widthValue,
                height: heightValue,
                top: Math.round(cropParams.y * originalHeight / 100),
                left: Math.round(cropParams.x * originalWidth / 100)
            });
            onCropChange({
                width: widthValue * 100 / originalWidth,
                height: heightValue * 100 / originalHeight
            });
        }
    };

    const switchRatio = () => {
        setKeepRatio(!keepRatio);
        if (!keepRatio) {
            crop({

            });
        }
    };

    return (
        <>
            <Typography variant="zeta">
                {t('label.contentManager.editImage.cropInfo')}
            </Typography>
            <div className={classes.form}>
                <div className={classes.firstCol}>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('label.contentManager.editImage.width')}</InputLabel>
                        <Input
                            id="width-field"
                            value={width ? width : originalWidth}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('label.contentManager.editImage.height')}</InputLabel>
                        <Input
                            id="height-field"
                            value={height ? height : originalHeight}
                            type="number"
                            margin="none"
                            onChange={setHeight}
                        />
                    </FormControl>
                </div>
                <div className={classes.secondCol}>
                    <IconButton icon={<Link color={keepRatio ? 'action' : 'inherit'}/>}
                                data-cm-role="keep-ratio-button"
                                onClick={switchRatio}/>
                </div>
            </div>
        </>
    );
};

CropPanel.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    cropParams: PropTypes.object,
    crop: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    onCropChange: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(CropPanel);
