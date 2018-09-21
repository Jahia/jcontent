import React from "react";
import PropTypes from 'prop-types';
import Select, {components} from 'react-select';
import {ArrowDropDown as ArrowDropDownIcon} from "@material-ui/icons";
import {ListItemIcon, ListItemText, Input, withStyles, MenuItem} from '@material-ui/core';
import * as _ from 'lodash';
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";

const styles = theme => ({
    root: {
        width: 'auto',
        minWidth: '100px',
        height: 34,
    },
    inputSize:  {
        height: 34,
        padding: '0!important'
    }
});

const ITEM_HEIGHT = 48;

const customStyles = {
    container: () => ({
        padding: 0,
    }),
    control: () => ({
        display: "flex",
        alignItems: "center",
        height: 34,
        width: '150px',
        background: "#007bc0",
        "&:hover": {
            boxShadow: "none"
        }
    }),
    menu: () => ({
        backgroundColor: "white",
        // boxShadow: "1px 2px 6px #888888", // should be changed as material-ui
        position: "absolute",
        left: 0,
        top: `calc(100% + 1px)`,
        width: "100%",
        zIndex: 2,
        maxHeight: ITEM_HEIGHT * 4.5
    }),
    menuList: () => ({
        maxHeight: ITEM_HEIGHT * 4.5,
        display: 'inline-block',
        color: 'white',
        background: '#504e4d',
        overflowY: "auto"
    }),
    input: () => ({
        height: 34,
        padding: "0px !important"

    }),
    placeholder: () => ({
        textAlign: 'center'
    }),
    singleValue: () => ({
        color: 'white',
        marginLeft: '2px',
        marginRight: '2px',
        maxWidth: 'calc(100% - 8px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100px',
        whiteSpace: 'nowrap',
        top: '50%',
    })
};

class Option extends React.Component {

    handleClick = event => {
        this.props.selectOption(this.props.data, event);
    };

    render() {

        const {data, children, isFocused, isSelected, onFocus} = this.props;

        return (
            <MenuItem
                onFocus={onFocus}
                selected={isFocused}
                onClick={this.handleClick}
                component="div"
                style={{
                    fontWeight: isSelected ? 500 : 400,
                    color: 'white',
                    minWidth: '100ox'
                }}
                title={data.title}
            >
                {data.icon != null &&
                    <ListItemIcon>
                        <img src={data.icon + '.png'}/>
                    </ListItemIcon>
                }
                <ListItemText>
                    {children}
                </ListItemText>
            </MenuItem>
        );
    }
}

class DropdownIndicator extends React.Component {

    render() {
        return (
            <components.DropdownIndicator {...this.props}>
                <ArrowDropDownIcon/>
            </components.DropdownIndicator>
        );
    }
};

class SelectWrapped extends React.Component {

    render() {

        const {classes, value, options, t, ...other} = this.props;
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
}

class FilterSelect extends React.Component {

    render() {

        let {classes, t, options, selectedOption, handleChange} = this.props;
        return (
            <div className={classes.root} data-cm-role={'filter-select'}>
                <Input
                    fullWidth
                    inputComponent={SelectWrapped}
                    onChange={handleChange}
                    value={selectedOption}
                    inputProps={{
                        options
                    }}
                />
            </div>
        );
    }
}

FilterSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    options: PropTypes.array.isRequired,
    selectedOption: PropTypes.string,
    handleChange : PropTypes.func
};

FilterSelect = compose(
    withStyles(styles),
    translate()
)(FilterSelect);

export default FilterSelect;