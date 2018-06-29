import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

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

class SideMenu extends React.Component {
    state = { open: false };

    handleClick = () => {
        this.setState(state => ({ open: !state.open }));
    };

    render() {
        const { classes, children, icon, text } = this.props;

        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem button onClick={this.handleClick}>
                        <ListItemIcon>
                            {icon}
                        </ListItemIcon>
                        <ListItemText inset primary={text}/>
                        {this.state.open ? <ExpandMore/> : <ChevronLeft/>}
                    </ListItem>
                    <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                        {children}
                    </Collapse>
                </List>
            </div>
        );
    }
}

export default withStyles(styles)(SideMenu);