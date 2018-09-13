import React from 'react';
import {setUrl} from "../redux/actions";
import {lodash as _} from "lodash";
import {connect} from "react-redux";

class RouterAction extends React.Component {
    render() {
        const {children, context, mode, actionKey, iframeUrl, setUrl, path, ...rest } = this.props;
        return children({...rest, onClick: () => setUrl(context.siteKey, context.lang, mode, (iframeUrl && actionKey) ? ("/" + actionKey) : path)})
    }
}

const mapStateToProps = (state, ownProps) => ({
    path: state.path
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (siteKey, lang, mode, path) => dispatch(setUrl(siteKey, lang, mode, path))
})

RouterAction = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(RouterAction);

export default RouterAction;

