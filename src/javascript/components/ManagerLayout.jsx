import React from 'react';
import {
    withStyles,
    Grid
} from '@material-ui/core';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';

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
        backgroundColor: theme.palette.layout.dark,
        padding: 0,
        paddingRight: '38px'
    },
    openDrawer: {
        marginLeft: theme.contentManager.leftNavigationDrawerWidth,
        padding: 0
    }
});

class MainView extends React.Component {
    render() {
        const {children, leftSide, classes, mode} = this.props;

        return (
            <div className={classes.root}>
                {leftSide}
                <div className={classes.content + ' ' + (mode === 'apps' ? classes.openDrawer : '')}>
                    {children}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    mode: state.mode
});

let Main = compose(
    connect(mapStateToProps, null),
    withStyles(styles)
)(MainView);

class ManagerLayout extends React.Component {
    render() {
        let {leftSide, children} = this.props;

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

export default ManagerLayout;
