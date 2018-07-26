import React from "react";
import PropTypes from 'prop-types';
import Select, {components} from 'react-select';
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {withStyles, Input, MenuItem, MenuList} from "@material-ui/core";
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
                { this.props.data.icon != null &&
                    <ListItemIcon>
                        <img src={this.props.data.icon + '.png'}/>
                    </ListItemIcon>
                }
                <ListItemText>
                    {children}
                </ListItemText>
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

const ITEM_HEIGHT = 48;

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

function SelectWrapped(props) {
    const {classes, value, options, ...other} = props;
    let optionValue = _.find(options, (data) => data.value === value);
    return (
        <Select
            components={{
                Option,
                DropdownIndicator,
            }}
            styles={customStyles}
            isClearable={true}
            options={options}
            value={optionValue}
            {...other}
        />
    );
}

const styles = theme => ({
    root: {
        display: 'inline-block',
        minWidth: 200,
    }
});

class FilterSelect extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(data) {
        let newValue = null;
        if (data != null) {
            newValue = data.value;
        }
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
                    value={this.props.selectedOption}
                    inputProps={{
                        options
                    }}
                />
            </div>);
    }
}

FilterSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    options: PropTypes.array.isRequired,
    selectedOption: PropTypes.string,
    onSelectionChange : PropTypes.func
};

FilterSelect = compose(
    withStyles(styles)
)(FilterSelect);

export default FilterSelect;