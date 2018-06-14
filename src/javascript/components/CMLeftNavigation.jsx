import React from "react";
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.global
    },
    collection: {
        paddingBottom: "20px",
        position: "relative"
    },
    collectionGroupHeader: {

    },
    collectionGroupIcon: {
    }
});

class CMLeftNavigation extends React.Component {

    render() {
        let {classes} = this.props;

        return (
            <div className={classes.root}>
                <div className={classes.collection}>
                    <div className={classes.collectionGroupHeader}>
                        <div className="collection-group-icon"/>
                        <h1>Contents</h1>
                    </div>
                    <div className="collection-group">
                        <div className="collection-entry">All Contents</div>
                        <div className="collection-entry">Planets</div>
                        <div className="collection-entry">Species</div>
                    </div>
                </div>
            </div>
        )
    }
}

CMLeftNavigation = withStyles(styles, {name:"DxContentManagerLeftNavigation"})(CMLeftNavigation);

export default translate()(CMLeftNavigation);