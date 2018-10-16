import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {translate} from "react-i18next";
import {withStyles, List, ListItem, withTheme} from "@material-ui/core";
import {compose} from "react-apollo/index";
import Actions from "../Actions";
import CmLeftDrawerContent from "../CmLeftDrawerContent";
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class ListAction extends Component {

    constructor(props) {

        super(props);

        this.state = {
            open: _.includes(this.props.actionPath.split("/"), this.props.actionKey)
        };

        this.handleListClick = this.handleListClick.bind(this);
    }

    handleListClick() {
        this.setState(prevState => {
            return {
                open: !prevState.open,
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
            {console.log("ListAction", this.props.actionKey, open)}
            {open &&
                <CmLeftDrawerContent {...rest} menuId={menuId}/>
            }
        </span>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    actionPath: state.path
});

ListAction = compose(
    translate(),
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps)
)(ListAction);

ListAction.propTypes = {
    menuId: PropTypes.string.isRequired
};

export default ListAction;
