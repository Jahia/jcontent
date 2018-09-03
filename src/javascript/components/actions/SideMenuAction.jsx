import React from "react";
import Collapse from "@material-ui/core/Collapse/Collapse";
import Actions from "../Actions";
import { List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import {compose} from "react-apollo";
import {translate} from "react-i18next";

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    },
});

class SideMenuAction extends React.Component {
    state = { open: false };

    handleClick = () => {
        this.setState(state => ({ open: !state.open }));
    };

    render() {
        const {menuId, children, context, classes, t, ...rest} = this.props;
        return (<React.Fragment>
                {children({...rest, onClick: this.handleClick})}
                <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <Actions menuId={menuId} context={{path: '', siteKey : context.siteKey, lang : context.lang}}>
                            {(props) =>
                                <ListItem button className={classes.nested} onClick={props.onClick}>
                                    <ListItemIcon>
                                        <ArrowForward/>
                                    </ListItemIcon>
                                    <ListItemText inset primary={t(props.labelKey)}/>
                                </ListItem>
                            }
                        </Actions>
                    </List>
                </Collapse>
            </React.Fragment>
        )
    };
}

SideMenuAction = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(SideMenuAction);


export default SideMenuAction;