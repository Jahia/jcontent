import React from 'react';
import {withStyles, Button} from "@material-ui/core";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {MoreHoriz} from "@material-ui/icons";

const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "left 0.5s ease 0s",
    },
    cmIcon: {
        color: theme.palette.primary.contrastText
    },
    button: {
        padding: 0,
        margin: '0!important'
    }
});

class CmIconButton extends React.Component {

    render() {
        const {classes, onClick, labelKey, t, children, cmRole, className, disableRipple} = this.props;
        let childrenCount = React.Children.count(children);
        return (
            <Button className={classes.button + " " + className} disableRipple={disableRipple ? disableRipple : false} aria-haspopup="true" onClick={(event) => onClick(event)} data-cm-role={cmRole}>
                {childrenCount > 0
                    ? <React.Fragment>{children}</React.Fragment>
                    : <MoreHoriz/>
                }
            </Button>
        )
    }
}

CmIconButton = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(CmIconButton);

export default CmIconButton;

