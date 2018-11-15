import React from "react";
import {composeActions} from "@jahia/react-material";
import {menuAction} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, menuAction, {
    init: (context) => {
        context.initRequirements();
    },
});