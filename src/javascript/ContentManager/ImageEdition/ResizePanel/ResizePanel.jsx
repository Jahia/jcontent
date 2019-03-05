import React from 'react';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    FormControl,
    IconButton,
    Input,
    MenuItem,
    Select,
    withStyles
} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Link} from 'mdi-material-ui';
import {Typography} from '@jahia/ds-mui-theme';
import {ExpandMore} from '@material-ui/icons';
import ImageActions from '../ImageActions';

let styles = () => ({
    panel: {
        flexDirection: 'column'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr'
    },
    inputs: {
        display: 'flex',
        flexDirection: 'column'
    },
    secondCol: {
        alignSelf: 'center',
        justifySelf: 'start',
        padding: '16px'
    },
    formControl: {
        width: '100%',
        padding: '16px 0'
    }
});

class RotatePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keepRatio: true
        };

        this.setWidth = this.setWidth.bind(this);
        this.setHeight = this.setHeight.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.switchRatio = this.switchRatio.bind(this);
    }

    setWidth(event) {
        const {originalWidth, originalHeight, height, resize} = this.props;
        const {keepRatio} = this.state;
        let value = event.target.value;

        if (/\d+/.test(value)) {
            resize({
                width: Math.round(value),
                height: Math.round(keepRatio ? value * originalHeight / originalWidth : height)
            });
        }
    }

    setHeight(event) {
        const {originalWidth, originalHeight, width, resize} = this.props;
        const {keepRatio} = this.state;
        let value = event.target.value;

        if (/\d+/.test(value)) {
            resize({
                width: Math.round(keepRatio ? value * originalWidth / originalHeight : width),
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

    undoChanges() {
        const {originalWidth, originalHeight, resize} = this.props;
        resize({
            width: originalWidth,
            height: originalHeight
        });
    }

    render() {
        const {t, classes, originalWidth, originalHeight, width, height, resize} = this.props;
        const {keepRatio} = this.state;

        let predefinedSizes = [
            {key: 1, width: originalWidth, height: originalHeight},
            {key: 2, width: 50, height: 12},
            {key: 3, width: 100, height: 43}
        ];

        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="zeta" color="alpha">{t('label.contentManager.editImage.resize')}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panel}>
                    <Typography variant="iota">You can select a predefined size or provide your own values</Typography>

                    <div className={classes.grid}>
                        <div>
                            <FormControl className={classes.formControl}>
                                <Select
                                    displayEmpty
                                    value={0}
                                    inputProps={{
                                        name: 'predefined',
                                        id: 'predefined-field'
                                    }}
                                    onChange={event => resize(predefinedSizes[event.target.value])}
                                >
                                    {predefinedSizes.map((s, index) => <MenuItem key={s.key} value={index}>{s.width} x {s.height}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </div>
                        <div/>
                        <div className={classes.inputs}>
                            <FormControl className={classes.formControl}>
                                <Input
                                    id="width-field"
                                    value={width}
                                    type="number"
                                    margin="none"
                                    onChange={this.setWidth}
                                />
                            </FormControl>
                            <FormControl className={classes.formControl}>
                                <Input
                                    id="height-field"
                                    value={height}
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
                    <ImageActions undoChanges={this.undoChanges}/>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles)
)(RotatePanel);
