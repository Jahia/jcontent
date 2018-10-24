import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Tooltip } from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';

const styles = theme => ({
    root: {
        width: 110,
        color: theme.palette.common.white,
        padding: 0,
        paddingRight: theme.spacing.unit,
        display: 'inline-grid',
    },
    track: {
        backgroundColor: theme.palette.common.white
    },
    thumb: {
        backgroundColor: theme.palette.common.white
    }
});

const totalsValues = 5;
const step = 1;

class FilesGridSizeSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: props.initValue,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, value) {
        this.setState({
            value
        });
        this.props.onChange(value);
    };

    getTooltipTitle(value) {
        switch(value) {
            case 1:
                return "x 6";
            case 2:
                return "x 4";
            case 3:
                return "x 3";
            case 4:
                return "x 2";
            case 5:
                return "x 1";
        }
    }

    render() {

        const {classes} = this.props;
        const {value} = this.state;

        return <Tooltip title={this.getTooltipTitle(value)}>
            <Slider
                value={value}
                classes={{root: classes.root, track: classes.track, thumb: classes.thumb}}
                min={1}
                max={totalsValues}
                step={step}
                onChange={this.handleChange}
            />
        </Tooltip>;
    }
}

FilesGridSizeSelector.propTypes = {
    classes: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    initValue: PropTypes.number.isRequired
};

export default withStyles(styles)(FilesGridSizeSelector);