import * as _ from "lodash";

let register = (eventType, eventHandler) => {
    if (window.parent[eventType]) {
        let eventHandlers = window.parent[eventType];
        if (_.indexOf(eventHandlers, eventHandler) < 0) {
            eventHandlers[eventHandlers.length] = eventHandler;
        }
    } else {
        window.parent[eventType] = [eventHandler];
    }
}

let unregister = (eventType, eventHandler) => {
    _.remove(window.parent[eventType], (eh) => (eh === eventHandler));
}

export {register, unregister}