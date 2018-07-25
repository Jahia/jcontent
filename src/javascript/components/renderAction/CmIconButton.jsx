import React from 'react';
import {withStyles, Button, IconButton} from "@material-ui/core/es/index";
import {compose} from "react-apollo/index";
import {translate} from "react-i18next";
import {MoreVert} from "@material-ui/icons/es/index";

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

class CmIconButton extends React.Component {

    render() {
        const {classes, onClick, labelKey, t} = this.props;
        return (
            <IconButton
                aria-haspopup="true"
                onClick={(event) => onClick(event)}>
                <MoreVert/>
            </IconButton>
        )
    }
}

CmIconButton = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(CmIconButton);

export default CmIconButton;

