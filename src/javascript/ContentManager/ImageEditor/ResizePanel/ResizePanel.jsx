import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FormControl, Input, InputLabel, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Link} from 'mdi-material-ui';
import {IconButton, Typography} from '@jahia/ds-mui-theme';

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

export const ResizePanel = ({t, classes, originalWidth, originalHeight, width, height, resize}) => {
    const [keepRatio, setKeepRatio] = useState(true);

    const setWidth = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            resize({
                width: Math.round(value),
                height: Math.round(keepRatio ? value * originalHeight / originalWidth : (height || originalHeight))
            });
        }
    };

    const setHeight = event => {
        let value = event.target.value;

        if (/\d+/.test(value)) {
            resize({
                width: Math.round(keepRatio ? value * originalWidth / originalHeight : (width || originalWidth)),
                height: Math.round(value)
            });
        }
    };

    const switchRatio = () => {
        setKeepRatio(!keepRatio);
        if (!keepRatio) {
            resize({
                width,
                height: Math.round(width * originalHeight / originalWidth)
            });
        }
    };

    return (
        <>
            <Typography variant="zeta">
                {t('label.contentManager.editImage.resizeInfo')}
            </Typography>
            <div className={classes.form}>
                <div className={classes.firstCol}>
                    <FormControl className={classes.formControl}>
                        <InputLabel className={classes.inputLabel}>{t('label.contentManager.editImage.width')}</InputLabel>
                        <Input
                            id="width-field"
                            value={width ? width : originalWidth}
                            type="number"
                            margin="none"
                            onChange={setWidth}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel className={classes.inputLabel}>{t('label.contentManager.editImage.height')}</InputLabel>
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
                    <IconButton icon={<Link color={keepRatio ? 'action' : 'default'}/>}
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
    width: PropTypes.number,
    height: PropTypes.number,
    resize: PropTypes.func.isRequired
};

ResizePanel.defaultProps = {
    width: null,
    height: null
};

export default compose(
    translate(),
    withStyles(styles)
)(ResizePanel);
