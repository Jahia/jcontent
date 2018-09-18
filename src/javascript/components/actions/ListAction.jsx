import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import {withStyles, List, ListItem, MenuItem} from "@material-ui/core";
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

        this.handleListClick = this.handleListClick.bind(this);
        this.handleListClose = this.handleListClose.bind(this);
    }

    handleListClick(event) {
        this.setState({anchor: event.currentTarget});
    };

    handleListClose() {
        this.setState({anchor: null});
    };

    render() {

        const {menuId, children, menuClose, t, ...rest} = this.props;
        const {anchor} = this.state;
        let handleListClose = menuClose || this.handleListClose;
        return (<span data-cm-role={'list-action-' + menuId}>
            {children({...rest, menuId: menuId, onClick: this.handleListClick})}
            <List
                id={menuId}
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => this.handleListClose()}>
                <Actions menuId={menuId} {...rest} handleListClose={handleListClose}>
                    {(menuConfig) => {
                        return  <ListItem button onClick={(event) => menuConfig.onClick(event)}>
                            {t(menuConfig.labelKey, menuConfig.labelParams)}
                        </ListItem>
                        }}
                </Actions>
            </List>
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