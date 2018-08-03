import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = {
    root: {
        flex: "0 0 auto",
        width: 150,
    },
};

const totalsValues = 5; // 2, 3, 4, 6, 12
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
        this.setState({ value });
        this.props.onChange(value);
    };

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <span className={classes.root}>
                <Slider value={ value } min={ 1 } max={ totalsValues } step={ step } onChange={ this.handleChange } />
            </span>
        );
    }
}

FilesGridSizeSelector.propTypes = {
    classes: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    initValue: PropTypes.number.isRequired
};

export default withStyles(styles)(FilesGridSizeSelector);