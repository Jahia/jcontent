import React from 'react';
import {withStyles} from "@material-ui/core/es/index";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {ExpandMore, ChevronLeft} from "@material-ui/icons";

const styles = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    },
});

class CmLeftMenuItem extends React.Component {

    render() {
        const {classes, onClick, hasChildren, t, icon, nested, open, labelKey} = this.props;
        return (
            <ListItem button className={nested ? classes.nested : ""} onClick={onClick}>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText inset primary={t(labelKey)} primaryTypographyProps={{'data-cm-role': 'left-menu-item-text'}}/>
                {hasChildren ? (open ? <ExpandMore/> : <ChevronLeft/>) : ""}
            </ListItem>
        )
    }
}

CmLeftMenuItem = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(CmLeftMenuItem);

export default CmLeftMenuItem;

