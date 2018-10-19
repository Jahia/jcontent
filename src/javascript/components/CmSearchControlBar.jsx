import React from 'react';
import {translate, Trans} from "react-i18next";
import {connect} from "react-redux";
import {cmSetPath} from "./redux/actions";
import {Button, withStyles} from "@material-ui/core";

const styles = theme => ({
    infoSearchPath: {
        color: theme.palette.text.primary,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    infoSearchPathValue: {
        color: "red"
    },
    searchClear: {
        maxHeight: 25,
        minHeight: 25,
        padding: '3px 7px',
    }
});

class CmSearchControlBar extends React.Component {

    render() {

        let {siteKey, path, setPath, t, classes} = this.props;
        let siteRootPath = "/sites/" + siteKey;

        return <div>
            <span className={classes.infoSearchPath}>
                <Trans
                    i18nKey={"label.contentManager.search.searchPath"}
                    values={{path: path}}
                    components={[<span className={classes.infoSearchPathValue}>univers</span>]}
                />
            </span>
            {(path != siteRootPath) &&
                <Button variant={"contained"}
                        classes={{sizeSmall: classes.searchClear}}
                        size={"small"} onClick={() => setPath(siteRootPath)}>
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