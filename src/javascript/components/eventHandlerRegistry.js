import * as _ from "lodash";

let register = (eventHandler) => {
    if (window.parent.contentModificationEventHandlers) {
        let eventHandlers = window.parent.contentModificationEventHandlers;
        if (!_.includes(eventHandlers, eventHandler)) {
            eventHandlers[eventHandlers.length] = eventHandler;
        }
    } else {
        window.parent.contentModificationEventHandlers = [eventHandler];
    }
}

let unregister = (eventHandler) => {
    _.remove(window.parent.contentModificationEventHandlers, (eh) => (eh === eventHandler));
}

export {register, unregister}