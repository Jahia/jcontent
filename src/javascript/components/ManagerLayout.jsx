import React from "react";
import {
    withStyles,
    Grid,
} from '@material-ui/core';
import {compose} from "react-apollo/index";

const styles = theme => ({
        root: {
            flexGrow: 1,
            zIndex: 1,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
        },
        content: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
            padding: theme.spacing.unit * 3,
        }
    }
);

class Main extends React.Component {

    render() {
        const {children, leftSide, classes } = this.props;
        return (
            <div className={classes.root}>
                {leftSide}
                <div className={classes.content}>
                    {children}
                </div>
            </div>
        );
    }
}

class ManagerLayout extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { leftSide, children } = this.props;
        return (
            <Grid container spacing={0}>

                <Grid item xs={12}>
                    <Main leftSide={leftSide}>
                        {children}
                    </Main>
                </Grid>
            </Grid>
        );
    }
}

Main = compose(
    withStyles(styles)
)(Main);


export default ManagerLayout;