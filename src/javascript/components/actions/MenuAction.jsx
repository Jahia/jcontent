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
            subMenu: null,
        };

        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleMenuClose = this.handleMenuClose.bind(this);
        this.handleCloseSubMenu = this.handleCloseSubMenu.bind(this);
    }

    handleMenuClick(event) {
        this.setState({anchor: event.currentTarget});
    };

    handleMenuClose() {
        this.setState({anchor: null});
    };

    handleCloseSubMenu(event){
        this.setState({
            subMenu: false,
            anchor: event.currentTarget,
        });
    }


    render() {

        const {menuId, children, ...rest} = this.props;
        const {anchor} = this.state;

        return (<span>
            {children({...rest, onClick: this.handleMenuClick})}
            <Menu
                id={menuId}
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => this.handleMenuClose()}>
                <Actions menuId={menuId} {...rest}>
                    {(props) => {
                        if(menuId !== 'publishMenu'){
                                return <CmMenuItem {...props} menuClose={this.handleCloseSubMenu}/>
                        }else{
                            return <CmMenuItem {...props} menuClose={this.handleMenuClose}/>
                        } }}
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