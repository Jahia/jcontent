import React from 'react';
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {cmSetPath} from "./redux/actions";
import {Button, withStyles} from "@material-ui/core";

const styles = theme => ({
    info: {
        color: theme.palette.text.primary,
        marginRight: theme.spacing.unit
    }
});

class CmSearchControlBar extends React.Component {

    render() {

        let {siteKey, path, setPath, t, classes} = this.props;
        let siteRootPath = "/sites/" + siteKey;

        return <div>
            <span className={classes.info}>
                {t("label.contentManager.search.underneathNode", {path: path})}
            </span>
            {(path != siteRootPath) &&
                <Button variant={"contained"} size={"small"} onClick={() => setPath(siteRootPath)}>
                    {t("label.contentManager.search.searchEverywhere")}
                </Button>
            }
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        siteKey: state.site,
        path: state.path
    }
};

const mapDispatchToProps = (dispatch, ownProps) => ({
    setPath: (path) => dispatch(cmSetPath(path))
});

CmSearchControlBar = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(CmSearchControlBar);

export default CmSearchControlBar;