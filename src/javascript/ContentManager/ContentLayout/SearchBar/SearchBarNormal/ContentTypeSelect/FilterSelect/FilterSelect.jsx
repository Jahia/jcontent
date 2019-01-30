import React from 'react';
import PropTypes from 'prop-types';
import {Input, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import SelectWrapped from './SelectWrapped/index';

const styles = () => ({
    root: {
        width: 'auto',
        minWidth: '100px',
        height: 48
    },
    inputPadding: {
        padding: 0
    },
    inputDetails: {
        border: 'none!important'
    },
    selectDetails: {
        border: 'none!important'
    },
    inputSize: {
        height: 48,
        padding: '0!important'
    },
    colorText: {
    }
});

export class FilterSelect extends React.Component {
    render() {
        let {classes, options, selectedOption, open, handleIndicator, handleChange} = this.props;
        return (
            <div className={classes.root} data-cm-role="filter-select">
                <Input
                    disableUnderline
                    fullWidth
                    classes={{root: classes.inputDetails, input: classes.inputPadding}}
                    inputComponent={SelectWrapped}
                    open={open}
                    value={selectedOption}
                    inputProps={{
                        options, open
                    }}
                    onChange={handleChange}
                    onKeyPress={handleIndicator}
                />
            </div>
        );
    }
}

FilterSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    handleChange: PropTypes.func,
    handleIndicator: PropTypes.func,
    open: PropTypes.bool,
    options: PropTypes.array.isRequired,
    selectedOption: PropTypes.string
};

FilterSelect.defaultProps = {
    selectedOption: null,
    handleChange: () => {},
    handleIndicator: () => {},
    open: false
};

export default compose(
    withStyles(styles),
    translate()
)(FilterSelect);
