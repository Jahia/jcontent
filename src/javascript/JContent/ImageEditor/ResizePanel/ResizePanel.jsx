import React from 'react';
import PropTypes from 'prop-types';
import {FormControl, Input, InputLabel, withStyles} from '@material-ui/core';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
import {Typography, Link, Button} from '@jahia/moonstone';

let styles = theme => ({
    panel: {
        flexDirection: 'column'
    },
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

export const ResizePanel = ({t, classes, originalWidth, originalHeight, resizeParams, onResize}) => {
    const setWidth = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            onResize({width: Math.round(value)});
        }
    };

    const setHeight = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            onResize({height: Math.round(value)});
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
            <div className={classes.form}>
                <div className={classes.firstCol}>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('jcontent:label.contentManager.editImage.width')}</InputLabel>
                        <Input
                            id="width-field"
                            value={resizeParams.width ? resizeParams.width : originalWidth}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink className={classes.inputLabel}>{t('jcontent:label.contentManager.editImage.height')}</InputLabel>
                        <Input
                            id="height-field"
                            value={resizeParams.height ? resizeParams.height : originalHeight}
                            type="number"
                            margin="none"
                            onChange={setHeight}
                        />
                    </FormControl>
                </div>
                <div className={classes.secondCol}>
                    <Button icon={<Link/>}
                            color={resizeParams.keepRatio ? 'accent' : 'default'}
                            size="big"
                            variant="ghost"
                            data-cm-role="keep-ratio-button"
                            onClick={switchRatio}/>
                </div>
            </div>
        </>
    );
};

ResizePanel.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    resizeParams: PropTypes.object.isRequired,
    onResize: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(ResizePanel);
