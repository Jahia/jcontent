import React from 'react';
import {cmGoto} from "../redux/actions";
import {lodash as _} from "lodash";
import {connect} from "react-redux";

class RouterAction extends React.Component {

    render() {
        const {children, context, mode, actionKey, handleDrawerClose, setUrl, ...rest} = this.props;
        return children({
            ...rest, onClick: (() => {
                handleDrawerClose && handleDrawerClose()
                setUrl(context.siteKey, context.lang, mode, mode === "apps" ? actionKey : "", {});
                return null;
            })
        })
    }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params}))
})

RouterAction = _.flowRight(
    connect(null, mapDispatchToProps)
)(RouterAction);

export default RouterAction;

