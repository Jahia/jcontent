import * as _ from 'lodash';

let doRegister = (eventHandler, eventHandlers) => {
    if (!_.includes(eventHandlers, eventHandler)) {
        eventHandlers[eventHandlers.length] = eventHandler;
    }
};

let doUnregister = (eventHandler, registry) => {
    _.remove(registry, eh => (eh === eventHandler));
};

let registerContentModificationEventHandler = eventHandler => {
    window.contentModificationEventHandlers = window.contentModificationEventHandlers || [];
    doRegister(eventHandler, window.contentModificationEventHandlers);
};

let unregisterContentModificationEventHandler = eventHandler => {
    doUnregister(eventHandler, window.contentModificationEventHandlers);
};

let registerPushEventHandler = eventHandler => {
    window.authoringApi = window.authoringApi || {};
    window.authoringApi.pushEventHandlers = window.authoringApi.pushEventHandlers || [];
    doRegister(eventHandler, window.authoringApi.pushEventHandlers);
};

let unregisterPushEventHandler = eventHandler => {
    doUnregister(eventHandler, window.authoringApi.pushEventHandlers);
};

export {
    registerContentModificationEventHandler,
    unregisterContentModificationEventHandler,
    registerPushEventHandler,
    unregisterPushEventHandler
};
