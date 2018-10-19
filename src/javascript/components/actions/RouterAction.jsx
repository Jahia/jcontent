import React from 'react';
import {CM_PREVIEW_STATES, cmGoto, cmSetPreviewState} from "../redux/actions";
import {lodash as _} from "lodash";
import {connect} from "react-redux";

class RouterAction extends React.Component {

    render() {

        const {children, context, mode, siteKey, language, handleDrawerClose, setUrl, setPreviewState, ...rest} = this.props;

        return children({
            ...rest,
            onClick: () => {
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
    }
}

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

RouterAction = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(RouterAction);

export default RouterAction;
