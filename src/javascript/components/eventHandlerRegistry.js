import * as _ from "lodash";

let doRegister = (eventHandler, registry) => {
    if (registry) {
        let eventHandlers = registry;
        if (!_.includes(eventHandlers, eventHandler)) {
            eventHandlers[eventHandlers.length] = eventHandler;
        }
    } else {
        registry = [eventHandler];
    }
}

let doUnregister = (eventHandler, registry) => {
    _.remove(registry, (eh) => (eh === eventHandler));
}

let registerContentModificationEventHandler = (eventHandler) => {
    window.parent.contentModificationEventHandlers = window.parent.contentModificationEventHandlers || [];
    doRegister(eventHandler, window.parent.contentModificationEventHandlers);
}

let unregisterContentModificationEventHandler = (eventHandler) => {
    doUnregister(eventHandler, window.parent.contentModificationEventHandlers);
}

let registerPushEventConsumer = (eventHandler) => {
    window.parent.authoringApi = window.parent.authoringApi || {};
    window.parent.authoringApi.pushEventHandlers = window.parent.authoringApi.pushEventHandlers || [];
    doRegister(eventHandler, window.parent.authoringApi.pushEventHandlers);
}

let unregisterPushEventConsumer = (eventHandler) => {
    doUnregister(eventHandler, window.parent.authoringApi.pushEventHandlers);
}

export {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler,
    registerPushEventConsumer,
    unregisterPushEventConsumer
}