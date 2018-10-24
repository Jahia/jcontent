import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Tooltip } from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';
import {translate} from "react-i18next";
import {compose} from "react-apollo";

const styles = theme => ({
    root: {
        display: 'inline-grid',
        width: 105,
        padding: 5,
        marginRight: theme.spacing.unit,
        verticalAlign: 'middle',
        color: theme.palette.common.white,
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

    render() {

        const {classes, t} = this.props;
        const {value} = this.state;

        return <Tooltip title={t('label.contentManager.filesGrid.fileSizeSelector')}>
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

FilesGridSizeSelector = compose(
    translate(),
    withStyles(styles)
)(FilesGridSizeSelector);

export default FilesGridSizeSelector;