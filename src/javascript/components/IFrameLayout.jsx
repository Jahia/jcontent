import React from 'react';
import Iframe from 'react-iframe';
import {lodash as _} from "lodash";
import connect from "react-redux/es/connect/connect";
import {setUrl} from "./redux/actions";

class IFrameLayout extends React.Component {

    render() {
        const { actionKey, actionsRegistry, workspace, siteKey, lang, contextPath, setUrl } = this.props;
        const action = actionsRegistry[actionKey];
        if (!action || !action.iframeUrl) {
            setUrl(null, null, "browse", "/", {});
            return null;
        }
        let iframeUrl = action.iframeUrl.replace(/:context/g, contextPath);
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
    lang: state.lang,
    siteKey: state.site
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (siteKey, lang, mode, path, params) => dispatch(setUrl(siteKey, lang, mode, path, params))
})

IFrameLayout = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(IFrameLayout);



export {IFrameLayout};