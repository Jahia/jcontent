export const actionTypes = {
    "CM_INVOKE_CONTEXTUAL_MENU" : "CM_INVOKE_CONTEXTUAL_MENU"
};

export const invokeContextualMenu = menuParams => {
    return {
        type: actionTypes.CM_INVOKE_CONTEXTUAL_MENU,
        contextualMenu: menuParams
    }
};