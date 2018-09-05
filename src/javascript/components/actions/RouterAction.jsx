import React from 'react';
import CmRouter from '../CmRouter';

class RouterAction extends React.Component {

    handleClick = (path, params, goto, switchto, context, mode) => {
        const url = "/" + context.siteKey + "/" + context.lang + "/" + mode;
        switchto(url, '');
    };

    render() {
        const {children, context, mode, ...rest} = this.props;
        return <CmRouter render={({path, params, goto, switchto}) => children({...rest, onClick: () => this.handleClick(path, params, goto, switchto, context, mode)})} />
    }
}

export default RouterAction;

