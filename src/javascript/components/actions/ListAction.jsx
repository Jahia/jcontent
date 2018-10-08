import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import {withStyles, List, ListItem} from "@material-ui/core";
import {compose} from "react-apollo/index";
import Actions from "../Actions";
import CmLeftDrawerContent from "../CmLeftDrawerContent";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class ListAction extends Component {

    constructor(props) {

        super(props);

        this.state = {
            open: _.includes(this.props.actionPath, this.props.actionKey),
            actionPath: this.props.actionPath
        };

        this.handleListClick = this.handleListClick.bind(this);
    }

    handleListClick() {
        this.setState(prevState => {
            return {
                open: !prevState.open,
                actionPath: []
            };
        });
    };

    render() {

        const {menuId, children, ...rest} = this.props;
        const {open} = this.state;

        return <span data-cm-role={'list-action-' + menuId}>
            {children({
                ...rest,
                open: open,
                hasChildren: true,
                menuId: menuId,
                onClick: this.handleListClick
            })}
            {console.log("ListAction",  this.props.actionKey, open)}
            {open &&
                <CmLeftDrawerContent {...rest} menuId={menuId} actionPath={this.state.actionPath}/>
            }
        </span>;
    }
}

ListAction = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(ListAction);

ListAction.propTypes = {
    menuId: PropTypes.string.isRequired
};

export default ListAction;
