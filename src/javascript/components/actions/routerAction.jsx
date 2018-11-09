import React from 'react';
import {CM_PREVIEW_STATES, cmGoto, cmSetPreviewState} from "../redux/actions";
import {composeActions} from "@jahia/react-material";
import {reduxAction} from "./reduxAction";

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params})),
    setPreviewState: (state) => {
        dispatch(cmSetPreviewState(state))
    }
});

const mapStateToProps = (state, ownProps) => ({
    language: state.language,
    siteKey: state.site
});

let routerAction = composeActions(reduxAction(mapStateToProps, mapDispatchToProps), {
    onClick: (context) => {
        const {mode, siteKey, language, handleDrawerClose, setUrl, setPreviewState} = context;

        mode !== "apps" && handleDrawerClose && handleDrawerClose();
        let pathSuffix = '';
        switch(mode) {
            case 'browse':
                pathSuffix = '/contents';
                break;
            case 'browse-files':
                pathSuffix =  '/files';
                break;
            default:
                pathSuffix = '';
        }
        setPreviewState(CM_PREVIEW_STATES.HIDE);
        setUrl(siteKey, language, mode, (mode === "apps" ? context.actionPath : `/sites/${siteKey}${pathSuffix}`), {});
        return null;
    }
});

export { routerAction};
