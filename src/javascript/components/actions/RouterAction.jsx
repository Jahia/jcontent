import React from 'react';
import {setUrl} from "../redux/actions";
import {lodash as _} from "lodash";
import {connect} from "react-redux";

class RouterAction extends React.Component {

    render() {
        const {children, context, mode, actionKey, handleDrawerClose, path, setUrl, ...rest} = this.props;
        const params = actionKey ? {actionKey: actionKey} : null;
        return children({
            ...rest, onClick: ((params) => {;
                handleDrawerClose()
                setUrl(context.siteKey, context.lang, mode, path, params);
                return null;
            }).bind(this, params)
        })
    }
}

const mapStateToProps = (state, ownProps) => ({
    path: state.path
})

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (siteKey, lang, mode, path, params) => dispatch(setUrl(siteKey, lang, mode, path, params))
})

RouterAction = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(RouterAction);

export default RouterAction;

