import React from "react";
import {setPanelState, setPath} from '../fileupload/redux/actions';
import {panelStates} from '../fileupload/constatnts';
import {batchActions} from 'redux-batched-actions';
import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {reduxAction} from "./reduxAction";

export default composeActions(requirementsAction, reduxAction(null, (dispatch)=>({dispatchBatch: (actions)=> dispatch(batchActions(actions))})), {
    init:(context) => {
        context.initRequirements({
            requiredPermission: "jcr:addChildNodes",
            showOnNodeTypes: ["jnt:folder"]
        });
    },

    onClick:(context) => {
        context.dispatchBatch([
            setPath(context.path),
            setPanelState(panelStates.VISIBLE)
        ]);
    }

});
