import React from 'react';
import {withStyles, Button} from "@material-ui/core/es/index";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";

const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "left 0.5s ease 0s",
    },
    button: {
        margin: theme.spacing.unit
    },
    buttonText: {
        margin: theme.spacing.unit * 0,
        marginRight: theme.spacing.unit * 1,
        color: theme.palette.common.white,
    }
});

class CmButton extends React.Component {

    render() {
        const {classes, onClick, labelKey, t, children, text} = this.props;
        let childrenCount = React.Children.count(children);
        if (text) {
            return (
                <Button
                    className={classes.buttonText}
                    variant="text"
                    size="medium"
                    onClick={(event) => onClick(event)}
                >
                    {childrenCount > 0 && children}
                    {t(labelKey)}
                </Button>
            )
        }
        else {
            return (
                <Button
                    className={classes.button}
                    variant="contained"
                    size="medium"
                    color="primary"
                    onClick={(event) => onClick(event)}
                >
                    {childrenCount > 0 && children}
                    {t(labelKey)}
                </Button>
            )
        }
    }
}

CmButton = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(CmButton);

export default CmButton;

