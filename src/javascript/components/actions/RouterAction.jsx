import React from 'react';
import CmRouter from '../CmRouter';

class RouterAction extends React.Component {

    handleClick = (params, switchToMode, mode, modeParams) => {
        params.modeParams = modeParams;
        switchToMode(mode, "", params);
    };

    render() {
        const {children, mode, modeParams, ...rest} = this.props;
        return <CmRouter render={({path, params, goto, switchto, switchToMode}) => children({
            ...rest,
            onClick: () => this.handleClick(params, switchToMode, mode, modeParams)
        })}/>
    }
}

export default RouterAction;

