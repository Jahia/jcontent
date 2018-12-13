import React from 'react';
import PropTypes from 'prop-types';
import Select, {components} from 'react-select';
import {ChevronDown} from 'mdi-material-ui';
import {Close as CloseIcon} from '@material-ui/icons';
import {ListItemIcon, ListItemText, Input, withStyles, withTheme, MenuItem} from '@material-ui/core';
import * as _ from 'lodash';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

const styles = () => ({
    root: {
        width: 'auto',
        minWidth: '100px',
        height: 48
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

const ITEM_HEIGHT = 48;

const customStyles = theme => ({
    container: () => ({
        padding: 0
    }),
    control: () => ({
        display: 'flex',
        color: theme.palette.text.contrastText,
        border: 'none',
        alignItems: 'center',
        height: 48,
        width: '155px',
        background: theme.palette.primary.main,
        '&:hover': {
            boxShadow: 'none'
        },
        '&>div': {
            overflow: 'visible!important'
        }
    }),
    group: () => ({
        color: 'orange'
    }),
    noOptionsMessage: () => ({
        width: '155px',
        color: theme.palette.text.secondary,
        padding: '8px 16px',
        minWidth: '155px',
        maxWidth: '155px'
    }),
    menu: () => ({
        backgroundColor: '#fff',
        color: 'red!important',
        // BoxShadow: "1px 2px 6px #888888", // should be changed as material-ui
        position: 'absolute',
        left: 0,
        top: 'calc(100% + 1px)',
        width: '100%',
        zIndex: 12,
        maxHeight: ITEM_HEIGHT * 4.5
    }),
    dropdownIndicator: base => ({
        ...base,
        color: theme.palette.text.constrastText,
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
        background: theme.palette.background.paper,
        overflowY: 'auto'
    }),
    input: () => ({
        color: theme.palette.text.constrastText
    }),
    placeholder: () => ({
        textAlign: 'center',
        color: theme.palette.text.constrastText
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
});

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
                    <ChevronDown fontSize="small"/>
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
                    <CloseIcon fontSize="small"/>
                </components.ClearIndicator>
            );
        }

        return <div/>;
    }
}

class SelectWrappedComponent extends React.Component {
    render() {
        const {value, open, options, theme, ...other} = this.props;
        let optionValue = _.find(options, data => data.value === value);

        return (
            <Select
                components={{
                    Option,
                    ClearIndicator,
                    DropdownIndicator,
                    ...other
                }}
                styles={customStyles(theme)}
                open={open}
                isClearable={open}
                options={options}
                value={optionValue}
                {...other}
            />
        );
    }
}

let SelectWrapped = withTheme()(SelectWrappedComponent);

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
