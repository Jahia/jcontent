import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import {Menu} from "@material-ui/core";
import {compose} from "react-apollo/index";
import Actions from "../Actions";
import CmMenuItem from "../renderAction/CmMenuItem";

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
        let items = [];
        const {menuId, children, menuClose, ...rest} = this.props;
        const {anchor} = this.state;
        let handleMenuClose = menuClose ? () => { menuClose(); this.handleMenuClose() } : this.handleMenuClose;
        let open = Boolean(anchor);
        return (<span data-cm-role={'menu-action-' + menuId}>
            {<Actions menuId={menuId} {...rest} menuClose={handleMenuClose}>
                    {(props) => {
                        !_.find(items, item => props.actionKey === item.key) && items.push(<CmMenuItem key={props.actionKey} {...props} menuClose={handleMenuClose}/>);
                        return false;
                    }}</Actions>}
            {children({...rest, menuId: menuId, onClick: this.handleMenuClick})}
            <Menu
                onExit={() => {if (menuClose) { menuClose() }}}
                id={menuId}
                anchorEl={anchor}
                BackdropProps={{invisible:true, onContextMenu: (event) => {event.preventDefault(); this.handleMenuClose()}}}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={open}
                onClose={() => this.handleMenuClose()}>
                {items}
            </Menu>
        </span>)
    }
}

MenuAction = compose(
    translate(),
)(MenuAction);

export default MenuAction;

MenuAction.propTypes = {
    menuId: PropTypes.string.isRequired
};