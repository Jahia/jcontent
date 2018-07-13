import React from "react";
import PropTypes from 'prop-types';
import CmRouter from "./CmRouter";

class CmLink extends React.Component {

    static propTypes = {
        goto: PropTypes.func,
        to: PropTypes.string.isRequired,
        params: PropTypes.object
    };

    render() {
        const { to, params, mode, ...rest } = this.props;
        return (<CmRouter render={({goto}) => (<a href={'#'} {...rest} onClick={() => goto(mode, params)}/>)}/>)
    }
}

export default CmLink;
