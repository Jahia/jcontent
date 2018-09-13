import React from 'react';
import Iframe from 'react-iframe';

class IFrameLayout extends React.Component {

    render() {
        const { actionKey, actionsRegistry, workspace, siteKey, lang, contextPath } = this.props;
        const action = actionsRegistry[actionKey];
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

export {IFrameLayout};