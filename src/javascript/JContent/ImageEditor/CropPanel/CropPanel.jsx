import React from 'react';
import PropTypes from 'prop-types';
import {FormControl, Input, InputLabel, withStyles} from '@material-ui/core';
import {IconButton, Typography} from '@jahia/design-system-kit';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
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

export const CropPanel = ({classes, t, onCrop, cropParams}) => {
    const setWidth = event => {
        let width = event.target.value;

        if (/\d+/.test(width)) {
            onCrop({width: parseInt(width, 10)});
        }
    };

    const setHeight = event => {
        let height = event.target.value;

        if (/\d+/.test(height)) {
            onCrop({height: parseInt(height, 10)});
        }
    };

    const switchRatio = () => {
        onCrop({aspect: !cropParams.aspect});
    };

    return (
        <>
            <Typography variant="zeta">
                {t('jcontent:label.contentManager.editImage.cropInfo')}
            </Typography>
            <div className={classes.form}>
                <div className={classes.firstCol}>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('jcontent:label.contentManager.editImage.width')}</InputLabel>
                        <Input
                            id="width-field"
                            value={cropParams.width ? Math.round(cropParams.width) : ''}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('jcontent:label.contentManager.editImage.height')}</InputLabel>
                        <Input
                            id="height-field"
                            value={cropParams.height ? Math.round(cropParams.height) : ''}
                            type="number"
                            margin="none"
                            onChange={setHeight}
                        />
                    </FormControl>
                </div>
                <div className={classes.secondCol}>
                    <IconButton icon={<Link color={cropParams.aspect === null ? 'inherit' : 'action'}/>}
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
    cropParams: PropTypes.object,
    onCrop: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(CropPanel);
