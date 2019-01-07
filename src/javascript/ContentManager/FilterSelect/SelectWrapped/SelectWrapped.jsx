import React from 'react';
import * as _ from 'lodash';
import Select from 'react-select';
import {withTheme} from '@material-ui/core';
import Option from './Option';
import ClearIndicator from './ClearIndicator';
import DropdownIndicator from './DropdownIndicator';

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
        flex: 1,
        whiteSpace: 'nowrap',
        top: '50%'
    })
});

export class SelectWrapped extends React.Component {
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

export default withTheme()(SelectWrapped);
