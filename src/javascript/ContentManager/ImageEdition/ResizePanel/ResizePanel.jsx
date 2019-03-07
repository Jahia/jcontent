import React from 'react';
import PropTypes from 'prop-types';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    FormControl,
    IconButton,
    Input,
    Tooltip,
    withStyles
} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Link} from 'mdi-material-ui';
import {Typography} from '@jahia/ds-mui-theme';
import {ExpandMore} from '@material-ui/icons';
import ImageActions from '../ImageActions';
import {PANELS} from '../ImageEdition';

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

export class RotatePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keepRatio: true
        };

        this.setWidth = this.setWidth.bind(this);
        this.setHeight = this.setHeight.bind(this);
        this.switchRatio = this.switchRatio.bind(this);
    }

    setWidth(event) {
        const {originalWidth, originalHeight, height, resize} = this.props;
        const {keepRatio} = this.state;
        let value = event.target.value;

        if (/\d+/.test(value)) {
            resize({
                width: Math.round(value),
                height: Math.round(keepRatio ? value * originalHeight / originalWidth : (height || originalHeight))
            });
        }
    }

    setHeight(event) {
        const {originalWidth, originalHeight, width, resize} = this.props;
        const {keepRatio} = this.state;
        let value = event.target.value;

        if (/\d+/.test(value)) {
            resize({
                width: Math.round(keepRatio ? value * originalWidth / originalHeight : (width || originalWidth)),
                height: Math.round(value)
            });
        }
    }

    switchRatio() {
        const {originalWidth, originalHeight, width, resize} = this.props;
        const {keepRatio} = this.state;
        this.setState({keepRatio: !keepRatio});
        if (!keepRatio) {
            resize({
                width,
                height: Math.round(width * originalHeight / originalWidth)
            });
        }
    }

    onChange(event, expanded) {
        let {onChangePanel} = this.props;
        if (expanded) {
            onChangePanel(PANELS.RESIZE);
        } else {
            onChangePanel(false);
        }
    }

    render() {
        const {t, classes, originalWidth, originalHeight, width, height, undoChanges, expanded, saveChanges, dirty, disabled} = this.props;
        const {keepRatio} = this.state;

        return (
            <Tooltip title={disabled ? t('label.contentManager.editImage.tooltip') : ''}>
                <ExpansionPanel expanded={expanded} disabled={disabled} onChange={(event, expanded) => this.onChange(event, expanded)}>
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
                                    onChange={this.setWidth}
                                />
                                </FormControl>
                                <FormControl className={classes.formControl}>
                                    <Input
                                    id="height-field"
                                    value={height ? height : originalHeight}
                                    type="number"
                                    margin="none"
                                    onChange={this.setHeight}
                                />
                                </FormControl>
                            </div>
                            <div className={classes.secondCol}>
                                <IconButton onClick={this.switchRatio}><Link color={keepRatio ? 'action' : 'default'}/>
                                </IconButton>
                            </div>
                        </div>
                        <ImageActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Tooltip>
        );
    }
}

RotatePanel.propTypes = {
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

RotatePanel.defaultProps = {
    width: null,
    height: null
};

export default compose(
    translate(),
    withStyles(styles)
)(RotatePanel);
