import React from 'react';
import PropTypes from 'prop-types';
import Select, {components} from 'react-select';
import {ArrowDropDown as ArrowDropDownIcon} from '@material-ui/icons';
import {Close as CloseIcon} from '@material-ui/icons';
import {ListItemIcon, ListItemText, Input, withStyles, MenuItem} from '@material-ui/core';
import * as _ from 'lodash';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

const styles = () => ({
    root: {
        width: 'auto',
        minWidth: '100px',
        height: 34
    },
    inputDetails: {
        borderBottom: 'none!important',
        boxShadow: 'none!important'
    },
    inputPadding: {
        padding: '0!important'
    },
    selectDetails: {
        borderBottom: 'none!important',
        boxShadow: 'none!important'
    },
    inputSize: {
        height: 34,
        padding: '0!important'
    },
    colorText: {
    }
});

const ITEM_HEIGHT = 48;

const customStyles = {
    container: () => ({
        padding: 0,
        color: '#fff'
    }),
    control: () => ({
        display: 'flex',
        color: '#fff',
        alignItems: 'center',
        height: 34,
        width: '155px',
        background: '#007bc0',
        '&:hover': {
            boxShadow: 'none'
        },
        '&>div': {
            overflow: 'visible!important'
        }
    }),
    group: () => ({
        color: '#fff'
    }),
    noOptionsMessage: () => ({
        width: '155px',
        color: '#8f9498',
        padding: '8px 16px',
        minWidth: '155px',
        maxWidth: '155px'
    }),
    menu: () => ({
        backgroundColor: '#ecebeb',
        color: '#3a3c3f!important',
        // BoxShadow: "1px 2px 6px #888888", // should be changed as material-ui
        position: 'absolute',
        left: 0,
        top: 'calc(100% + 1px)',
        width: '100%',
        zIndex: 2,
        maxHeight: ITEM_HEIGHT * 4.5
    }),
    dropdownIndicator: base => ({
        ...base,
        color: '#fff',
        cursor: '-webkit-grabbing'
    }),
    clearIndicator: base => ({
        ...base,
        color: 'white',
        cursor: '-webkit-grabbing'
    }),
    indicatorSeparator: base => ({
        ...base,
        display: 'none'
    }),
    menuList: () => ({
        maxHeight: ITEM_HEIGHT * 4.5,
        boxShadow: '1px 3px 4px 0px rgba(38, 38, 38, 0.4)',
        display: 'inline-block',
        background: '#ecebeb',
        overflowY: 'auto'
    }),
    input: () => ({
        color: '#fff!important'
    }),
    placeholder: () => ({
        textAlign: 'center',
        color: '#fff!important'
    }),
    singleValue: () => ({
        marginLeft: '2px',
        marginRight: '2px',
        maxWidth: 'calc(100% - 8px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100px',
        whiteSpace: 'nowrap',
        top: '50%'
    })
};

class Option extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        this.props.selectOption(this.props.data, event);
    }

    render() {
        const {data, children, isFocused, isSelected, onFocus} = this.props;

        return (
            <MenuItem
                selected={isFocused}
                component="div"
                style={isFocused ?
                    {
                        fontWeight: isSelected ? 500 : 400,
                        color: '#ffffff',
                        minWidth: '155px'
                    } :
                    {
                        fontWeight: isSelected ? 500 : 400,
                        color: '#3a3c3f',
                        minWidth: '155px'
                    }
                }
                title={data.title}
                onClick={this.handleClick}
                onFocus={onFocus}
            >
                {data.icon !== null &&
                    <ListItemIcon>
                        <img src={data.icon + '.png'}/>
                    </ListItemIcon>
                }
                <ListItemText disableTypography>
                    {children}
                </ListItemText>
            </MenuItem>
        );
    }
}

class DropdownIndicator extends React.Component {
    render() {
        if (!this.props.selectProps.open) {
            return (
                <components.DropdownIndicator {...this.props}>
                    <ArrowDropDownIcon/>
                </components.DropdownIndicator>
            );
        }

        return <div/>;
    }
}

class ClearIndicator extends React.Component {
    render() {
        if (this.props.selectProps.open) {
            return (
                <components.ClearIndicator {...this.props}>
                    <CloseIcon style={{fontSize: '18px'}}/>
                </components.ClearIndicator>
            );
        }

        return <div/>;
    }
}

class SelectWrapped extends React.Component {
    render() {
        const {value, open, options, ...other} = this.props;
        let optionValue = _.find(options, data => data.value === value);

        return (
            <Select
                components={{
                    Option,
                    ClearIndicator,
                    DropdownIndicator,
                    ...other
                }}
                styles={customStyles}
                open={open}
                isClearable={open}
                options={options}
                value={optionValue}
                {...other}
            />
        );
    }
}

class FilterSelect extends React.Component {
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
    options: PropTypes.array.isRequired,
    selectedOption: PropTypes.string,
    handleChange: PropTypes.func
};

FilterSelect.defaultProps = {
    selectedOption: null,
    handleChange: () => {}
};

export default compose(
    withStyles(styles),
    translate()
)(FilterSelect);
