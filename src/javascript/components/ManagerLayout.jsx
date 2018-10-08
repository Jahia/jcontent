import React from "react";
import {
    withStyles,
    Grid
} from '@material-ui/core';
import {compose} from "react-apollo/index";
import connect from "react-redux/es/connect/connect";

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex'
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3
    },
    openDrawer: {
        marginLeft: "289px",
        padding: 0
    }
});

class Main extends React.Component {

    render() {

        const {children, leftSide, classes, mode} = this.props;

        return <div className={classes.root}>
            {leftSide}
            <div className={classes.content + " " + (mode === "apps" ? classes.openDrawer : "")}>
                {children}
            </div>
        </div>;
    }
}

class ManagerLayout extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let {leftSide, children, mode} = this.props;

        return <Grid container spacing={0}>
            <Grid item xs={12}>
                <Main leftSide={leftSide} mode={mode}>
                    {children}
                </Main>
            </Grid>
        </Grid>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    mode: state.mode
});

Main = compose(
    connect(mapStateToProps, null),
    withStyles(styles)
)(Main);


export default ManagerLayout;