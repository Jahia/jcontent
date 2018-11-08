import React from "react";
import {translate} from "react-i18next";
import * as _ from "lodash";
import {withNotifications} from "@jahia/react-material/index";
import {connect} from "react-redux";
import Actions from "../Actions";
import CmButton from "../leftMenu/CmButton";


class PasteAction extends React.Component {

    render() {
        const { items, path, buttonClass } = this.props;

        if (items.length === 0) return null;

        return <Actions menuId={"copyPasteActions"} context={{path: path}} className={buttonClass}>
            {(props) => <CmButton text={true} {...props} />}
        </Actions>
    }
}

const mapStateToProps = (state, ownProps) => {
    return state.copyPaste;
};

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch: dispatch
    }
};


PasteAction = _.flowRight(
    withNotifications(),
    translate(),
    connect(mapStateToProps, mapDispatchToProps)
)(PasteAction);

export default PasteAction;