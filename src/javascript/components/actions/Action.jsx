import React from 'react';

class Action extends React.Component {

    render() {
        const {call, children, context, ...rest} = this.props;
        return children({...rest, onClick: () => call(context.path)})
    }
}


export default Action;

