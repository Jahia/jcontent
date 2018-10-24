import React from 'react';
import {withStyles, Button} from "@material-ui/core";
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
        padding: '0 10 0 0'
    },
    buttonText: {
        margin: theme.spacing.unit * 0,
        marginRight: theme.spacing.unit * 1,
        color: theme.palette.common.white,
    },
    buttonSize: {
        maxHeight: '36px',
        margin: '0px !important'
    },
    buttonSizeText: {
        maxHeight: '36px',
    },
});

class CmButton extends React.Component {

    render() {

        const {classes, onClick, labelKey, t, children, text} = this.props;
        let childrenCount = React.Children.count(children);

        return <Button
            classes={text ? {root: classes.buttonSize} : {root: classes.buttonSizeText}}
            className={text ? classes.button : classes.buttonText}
            color={text ? 'default' : 'primary'}
            variant={text ? "text" : "contained"}
            size="medium"
            onClick={(event) => onClick(event)}
        >
            {childrenCount > 0 &&
                children
            }
            {t(labelKey)}
        </Button>;
    }
}

CmButton = compose(
    translate(),
    withStyles(styles, {withTheme: true})
)(CmButton);

export default CmButton;
