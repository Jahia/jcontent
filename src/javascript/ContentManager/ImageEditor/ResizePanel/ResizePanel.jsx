import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
    FormControl,
    Input,
    Tooltip,
    withStyles
} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Link} from 'mdi-material-ui';
import {Typography, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, IconButton} from '@jahia/ds-mui-theme';
import {ExpandMore} from '@material-ui/icons';
import ImageEditorActions from '../ImageEditorActions';
import {PANELS} from '../ImageEditor';

let styles = () => ({
    panel: {
        flexDirection: 'column'
    },
    form: {
        display: 'flex',
        flexDirection: 'row'
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
    }
});

export const ResizePanel = ({t, classes, originalWidth, originalHeight, width, height, undoChanges, expanded, saveChanges, dirty, disabled, resize, onChangePanel}) => {
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

    const onChange = (event, expanded) => {
        if (expanded) {
            onChangePanel(PANELS.RESIZE);
        } else {
            onChangePanel(false);
        }
    };

    return (
        <Tooltip title={disabled ? t('label.contentManager.editImage.tooltip') : ''}>
            <ExpansionPanel expanded={expanded} disabled={disabled} onChange={onChange}>
                <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="zeta" color="alpha">{t('label.contentManager.editImage.resize')}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panel}>
                    <Typography variant="iota">{t('label.contentManager.editImage.resizeInfo')}</Typography>

                    <div className={classes.form}>
                        <div className={classes.firstCol}>
                            <FormControl className={classes.formControl}>
                                <Input
                                    id="width-field"
                                    value={width ? width : originalWidth}
                                    type="number"
                                    margin="none"
                                    onChange={setWidth}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
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
                            <IconButton icon={<Link color={keepRatio ? 'action' : 'default'}/>} onClick={switchRatio}/>
                        </div>
                    </div>
                </ExpansionPanelDetails>
                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
            </ExpansionPanel>
        </Tooltip>
    );
};

ResizePanel.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    dirty: PropTypes.bool.isRequired,
    saveChanges: PropTypes.func.isRequired,
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    undoChanges: PropTypes.func.isRequired,
    resize: PropTypes.func.isRequired,
    onChangePanel: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired
};

ResizePanel.defaultProps = {
    width: null,
    height: null
};

export default compose(
    translate(),
    withStyles(styles)
)(ResizePanel);
