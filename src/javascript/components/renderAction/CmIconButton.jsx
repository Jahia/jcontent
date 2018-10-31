import React from 'react';
import {withStyles, Button, Tooltip, TableCell} from "@material-ui/core";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {MoreHoriz, MoreVert} from "@material-ui/icons";

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
        margin: '0 !important'
    },
    horizontalButton: {
        color: theme.palette.background.default,
        paddingTop: '6px !important',
    },
    horizontalButtonStyle2: {
        color: theme.palette.background.default,
    },
    buttonFooter: {
        padding: 0,
        margin: '0 !important',
    }
});

class CmIconButton extends React.Component {

    //listTable is an attribute to know if it's a button used into list table (true) or in preview (false)
    render() {

        const {classes, onClick, labelKey, t, footer, children, cmRole, className, disableRipple, horizontal, style2, tooltip} = this.props;
        let childrenCount = React.Children.count(children);

        let button = horizontal

            ? <Button
                className={style2
                    ? classes.buttonFooter + " " + className + " " + classes.horizontalButtonStyle2
                    : classes.buttonFooter + " " + className + " " + classes.horizontalButton
                }
                disableRipple={disableRipple ? disableRipple : false}
                aria-haspopup="true"
                onClick={(event) => onClick(event)}
                data-cm-role={cmRole}
            >
                {childrenCount > 0
                    ? <React.Fragment>{children}</React.Fragment>
                    : <MoreVert/>
                }
            </Button>

            : <Button
                className={classes.button + " " + className}
                disableRipple={disableRipple ? disableRipple : false}
                aria-haspopup="true"
                onClick={(event) => onClick(event)}
                data-cm-role={cmRole}
            >
                {childrenCount > 0
                    ? <React.Fragment>{children}</React.Fragment>
                    : <MoreHoriz/>
                }
            </Button>;

        if (tooltip) {
            button = <Tooltip title={tooltip}>{button}</Tooltip>;
        }

        return button;
    }
}

CmIconButton = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(CmIconButton);

export default CmIconButton;
