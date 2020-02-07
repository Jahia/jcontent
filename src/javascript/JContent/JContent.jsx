import React from 'react';
import PropTypes from 'prop-types';
import AppLayout from './AppLayout';

class JContent extends React.Component {
    constructor(props) {
        super(props);
        window.forceCMUpdate = this.forceCMUpdate.bind(this);
        this.forceCMUpdate = this.forceCMUpdate.bind(this);
    }

    // !!this method should never be called but is necessary until BACKLOG-8369 fixed!!
    forceCMUpdate() {
        console.warn('update application, this should not happen ..');
        this.forceUpdate();
    }

    render() {
        let {dxContext} = this.props;
        return (
            <>
                <AppLayout dxContext={dxContext}/>
            </>
        );
    }
}

JContent.propTypes = {
    dxContext: PropTypes.object.isRequired
};

export default JContent;
