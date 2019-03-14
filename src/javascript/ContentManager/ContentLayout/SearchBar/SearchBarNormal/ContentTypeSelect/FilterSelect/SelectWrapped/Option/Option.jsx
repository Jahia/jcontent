import React from 'react';
import PropTypes from 'prop-types';
import {ListItemIcon, ListItemText, MenuItem} from '@material-ui/core';

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

Option.propTypes = {
    children: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    isFocused: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onFocus: PropTypes.func,
    selectOption: PropTypes.func.isRequired
};

Option.defaultProps = {
    onFocus: () => {}
};

export default Option;
