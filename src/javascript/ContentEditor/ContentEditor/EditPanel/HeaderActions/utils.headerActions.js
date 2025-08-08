import {registry} from '@jahia/ui-extender';

export const getButtonLimitValue = () => {
    const configValue = contextJsParameters.config.jcontent?.['contentEditorQuickActionsButtons.limit'];
    const parsedValue = parseInt(configValue, 10);

    return isNaN(parsedValue) ? 5 : parsedValue; // Default is 5 quick buttons
};

export const getMenuActions = (offset, limit, actionTarget = 'content-editor/header/3dots') => {
    return registry
        .find({type: 'action', target: actionTarget})
        .filter((action, index) =>
            index >= offset && index < (offset + limit))
        .map(action => action.key);
};
