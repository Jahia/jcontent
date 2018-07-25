import React from "react";
import PropTypes from 'prop-types';
import Select, {components} from 'react-select';
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import {withStyles, Input, MenuItem} from "@material-ui/core";
import * as _ from 'lodash';
import {compose} from "react-apollo/index";

class Option extends React.Component {
    handleClick = event => {
        this.props.selectOption(this.props.data, event);
    };

    render() {
        const {children, isFocused, isSelected, onFocus} = this.props;
        return (
            <MenuItem
                onFocus={onFocus}
                selected={isFocused}
                onClick={this.handleClick}
                component="div"
                style={{
                    fontWeight: isSelected ? 500 : 400
                }}
                title={this.props.data.title}
            >
                {this.props.data.icon != null ?
                    (<img src={this.props.data.icon + '.png'}/>)
                    : (<div/>)
                }
                {children}
            </MenuItem>
        );
    }
}

const DropdownIndicator = (props) => {
    return components.DropdownIndicator && (
        <components.DropdownIndicator {...props}>
            <ArrowDropDownIcon/>
        </components.DropdownIndicator>
    );
};

function SelectWrapped(props) {
    const {classes, value, options, ...other} = props;
    let optionValue = _.find(options, (data) => data.value === value);
    return (
        <Select
            components={{
                Option,
                DropdownIndicator
            }}
            styles={customStyles}
            isClearable={true}
            options={options}
            value={optionValue}
            {...other}
        />
    );
}

const ITEM_HEIGHT = 48;

const styles = theme => ({
    root: {
        display: 'inline-block',
        minWidth: 200,
    },
    chip: {
        margin: theme.spacing.unit / 4
    }
});

const customStyles = {
    control: () => ({
        display: "flex",
        alignItems: "center",
        border: 0,
        height: "auto",
        background: "transparent",
        "&:hover": {
            boxShadow: "none"
        }
    }),
    menu: () => ({
        backgroundColor: "white",
        boxShadow: "1px 2px 6px #888888", // should be changed as material-ui
        position: "absolute",
        left: 0,
        top: `calc(100% + 1px)`,
        width: "100%",
        zIndex: 2,
        maxHeight: ITEM_HEIGHT * 4.5
    }),
    menuList: () => ({
        maxHeight: ITEM_HEIGHT * 4.5,
        overflowY: "auto"
    })
};

class FilterSelect extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            contentType: props.contentType !== undefined ? props.contentType : '',
        };
    }

    handleChange(data) {
        let newValue = '';
        if (data != null) {
            newValue = data.value;
        }
        this.setState({contentType: newValue});
        if (this.props.onSelectionChange !== undefined) {
            this.props.onSelectionChange(newValue);
        }
    };

    render() {
        let {classes, options} = this.props;

        return (
            <div className={classes.root}>
                <Input
                    fullWidth
                    inputComponent={SelectWrapped}
                    onChange={this.handleChange}
                    value={this.state.contentType}
                    inputProps={{
                        options
                    }}
                />
            </div>);
    }
}

FilterSelect.propTypes = {
    classes: PropTypes.object.isRequired,
};

FilterSelect = compose(
    withStyles(styles)
)(FilterSelect);

export default FilterSelect;