import React from 'react';
import {withStyles, Button} from "@material-ui/core";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";

const styles = theme => ({
    buttonText: {
        maxHeight: '36px',
        margin: 0,
        marginRight: theme.spacing.unit,
    },
    button: {
        maxHeight: '36px',
        margin: 0,
        marginRight: theme.spacing.unit,
        color: theme.palette.common.white,
    },
});

class CmButton extends React.Component {

    render() {

        const {classes, onClick, labelKey, t, children, text} = this.props;
        let childrenCount = React.Children.count(children);

        return <Button
            className={text ? classes.buttonText : classes.button}
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
