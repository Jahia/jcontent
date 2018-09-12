import React from 'react';
import CmRouter from '../CmRouter';

class RouterAction extends React.Component {

    handleClick = (path, params, goto, switchto, context, mode, actionKey, iframeUrl) => {
        let url = "/" + context.siteKey + "/" + context.lang + "/" + mode;
        if (iframeUrl && actionKey) {
            url += "/" + actionKey
        }
        switchto(url, '');
    };

    render() {
        const {children, context, mode, actionKey, iframeUrl, ...rest } = this.props;
        return <CmRouter render={({path, params, goto, switchto}) => children({...rest, onClick: () => this.handleClick(path, params, goto, switchto, context, mode, actionKey, iframeUrl)})} />
    }
}

export default RouterAction;

