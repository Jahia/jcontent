import { actionTypes } from "./actions";

const defaultContextualMenuState = {
    isOpen: false,
    event: null,
    path: null,
    uuid: null,
    displayName:null,
    nodeName: null,
    menuId: null
};

export const contextualMenuReducer = (state = defaultContextualMenuState, action) => {
    switch(action.type) {
        case  actionTypes.CM_INVOKE_CONTEXTUAL_MENU :
            if (action.contextualMenu.isOpen) {
                action.contextualMenu.event.preventDefault();
                action.contextualMenu.event.persist();
                return action.contextualMenu
            } else {
                return {
                    isOpen: false,
                    event: null,
                    path: null,
                    uuid: null,
                    displayName:null,
                    nodeName: null,
                    menuId: null
                }
            }
        default: return state;
    }
};

