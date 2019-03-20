import React from 'react';
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

export const CropPanel = ({classes, t, originalWidth, originalHeight, cropParams, width, height, onCropChange}) => {
    const setWidth = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            const widthValue = value > originalWidth ? originalWidth : Math.round(value);
            const heightValue = Math.round(cropParams.aspect !== null && originalHeight && originalWidth ? value * originalHeight / originalWidth : (height || originalHeight));
            const widthPercent = widthValue * 100 / originalWidth;
            onCropChange({
                width: widthPercent,
                height: heightValue * 100 / originalHeight,
                y: cropParams.y,
                x: (cropParams.x + widthPercent) > 100 ? (cropParams.x + (100 - (cropParams.x + widthPercent))) : cropParams.x,
                aspect: cropParams.aspect
            }, originalHeight, originalWidth);
        }
    };

    const setHeight = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            const widthValue = Math.round(cropParams.aspect !== null && originalHeight && originalWidth ? value * originalWidth / originalHeight : (width || originalWidth));
            const heightValue = value > originalHeight ? originalHeight : Math.round(value);
            const heightPercent = heightValue * 100 / originalHeight;
            onCropChange({
                width: widthValue * 100 / originalWidth,
                height: heightPercent,
                y: (cropParams.y + heightPercent) > 100 ? (cropParams.y + (100 - (cropParams.y + heightPercent))) : cropParams.y,
                x: cropParams.x,
                aspect: cropParams.aspect
            }, originalHeight, originalWidth);
        }
    };

    const switchRatio = () => {
        onCropChange({
            width: cropParams.width,
            height: cropParams.height,
            x: cropParams.x,
            y: cropParams.y,
            aspect: cropParams.aspect === null ? ((width && height) ? width / height : originalWidth / originalHeight) : null
        }, originalHeight, originalWidth);
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
                            value={width ? width : Math.round(cropParams.width * originalWidth / 100)}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('label.contentManager.editImage.height')}</InputLabel>
                        <Input
                            id="height-field"
                            value={height ? height : Math.round(cropParams.height * originalHeight / 100)}
                            type="number"
                            margin="none"
                            onChange={setHeight}
                        />
                    </FormControl>
                </div>
                <div className={classes.secondCol}>
                    <IconButton icon={<Link color={cropParams.aspect !== null ? 'action' : 'inherit'}/>}
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
    width: PropTypes.number,
    height: PropTypes.number,
    onCropChange: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(CropPanel);
