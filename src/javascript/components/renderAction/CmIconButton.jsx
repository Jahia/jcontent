import React from 'react';
import {withStyles, IconButton} from "@material-ui/core";
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
    button: {
        margin: theme.spacing.unit
    }
});

class CmIconButton extends React.Component {

    render() {
        const {classes, onClick, labelKey, t, children} = this.props;
        let childrenCount = React.Children.count(children);
        return (
            <IconButton aria-haspopup="true" onClick={(event) => onClick(event)}>
                {childrenCount > 0
                    ? <React.Fragment>{children}</React.Fragment>
                    : <MoreHoriz/>
                }
            </IconButton>
        )
    }
}

CmIconButton = compose(
    translate(),
    withStyles(styles, { withTheme: true })
)(CmIconButton);

export default CmIconButton;

