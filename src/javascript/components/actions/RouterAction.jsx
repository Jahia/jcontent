import React from 'react';
import {cmGoto} from "../redux/actions";
import {lodash as _} from "lodash";
import {connect} from "react-redux";

class RouterAction extends React.Component {

    render() {
        const {children, context, mode, siteKey, language, handleDrawerClose, setUrl, ...rest} = this.props;
        return children({
            ...rest, onClick: (() => {
                mode !== "apps" && handleDrawerClose && handleDrawerClose();
                setUrl(siteKey, language, mode, mode === "apps" ? context.actionPath : "/sites/" + siteKey, {});
                return null;
            })
        })
    }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params}))
})

const mapStateToProps = (state, ownProps) => ({
    language: state.language,
    siteKey: state.site,
})

RouterAction = _.flowRight(
    connect(mapStateToProps, mapDispatchToProps)
)(RouterAction);

export default RouterAction;

