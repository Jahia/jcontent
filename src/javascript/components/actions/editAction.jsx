import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";

export default composeActions(requirementsAction, {
    onClick: (context) => window.parent.authoringApi.editContent(context.path, context.displayName, ["jnt:content"], [context.primaryNodeType], context.uuid, false),
});