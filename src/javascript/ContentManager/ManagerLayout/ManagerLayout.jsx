import React from 'react';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {connect} from 'react-redux';

const styles = theme => ({
    root: {
        position: 'relative',
        display: 'flex'
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.layout.dark,
        padding: 0,
        paddingRight: theme.spacing.unit * 4
    },
    openDrawer: {
        marginLeft: theme.contentManager.leftNavigationDrawerWidth,
        padding: 0
    }
});

export class ManagerLayout extends React.Component {
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

export default compose(
    connect(mapStateToProps, null),
    withStyles(styles)
)(ManagerLayout);
