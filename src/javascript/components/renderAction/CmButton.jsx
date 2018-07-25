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
    }
});

class CmButton extends React.Component {

    render() {
        const {classes, onClick, labelKey, t} = this.props;
        return (
            <Button className={classes.button}
                    variant="contained"
                    size="medium"
                    color="primary"
                    onClick={(event) => onClick(event)}>
                {t(labelKey)}
            </Button>
        )
    }
}

CmButton = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(CmButton);

export default CmButton;

