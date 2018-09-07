import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import {withStyles, Menu} from "@material-ui/core";
import {compose} from "react-apollo/index";
import Actions from "../Actions";
import CmMenuItem from "../renderAction/CmMenuItem";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class MenuAction extends Component {

    constructor(props) {

        super(props);

        this.state = {
            anchor: null,
        };

        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
    }

    handleMenuClick(event) {
        this.setState({anchor: event.currentTarget});
    };

    handleMenuClose() {
        this.setState({anchor: null});
    };

    render() {

        const {menuId, children, menuClose, ...rest} = this.props;
        const {anchor} = this.state;
        let handleMenuClose = menuClose || this.handleMenuClose;
        return (<span data-cm-role={'menu-action-' + menuId}>
            {children({...rest, menuId: menuId, onClick: this.handleMenuClick})}
            <Menu
                id={menuId}
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => this.handleMenuClose()}>
                <Actions menuId={menuId} {...rest} menuClose={handleMenuClose}>
                    {(props) => {
                        return <CmMenuItem {...props} menuClose={handleMenuClose}/>
                        }}
                </Actions>
            </Menu>
        </span>)
    }
}

MenuAction = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(MenuAction);

export default MenuAction;

MenuAction.propTypes = {
    menuId: PropTypes.string.isRequired
};