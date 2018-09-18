import React from 'react';
import Iframe from 'react-iframe';
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {cmGoto} from "./redux/actions";

class IFrameLayout extends React.Component {

    render() {
        const { actionKey, actionsRegistry, workspace, siteKey, lang, contextPath, setUrl } = this.props;
        const action = actionsRegistry[actionKey];
        if (!action || !action.iframeUrl) {
            setUrl(null, null, "browse", "/", {});
            return null;
        }
        let iframeUrl = action.iframeUrl.replace(/:context/g, contextPath.substring(1)); // remove starting "/"
        iframeUrl = iframeUrl.replace(/:workspace/g, workspace);
        iframeUrl = iframeUrl.replace(/:lang/g, lang);
        iframeUrl = iframeUrl.replace(/:site/g, siteKey);

        return <Iframe url={iframeUrl}
                       position="relative"
                       width="100%"
                       className="myClassname"
                       height="100%"
                       allowFullScreen/>
    }

}


const mapStateToProps = (state, ownProps) => ({
    actionKey: state.params.actionKey,
    lang: state.language,
    siteKey: state.site
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params}))
})

IFrameLayout = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(IFrameLayout);



export {IFrameLayout};