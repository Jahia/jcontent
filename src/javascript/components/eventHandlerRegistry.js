import * as _ from "lodash";

const context = {
}

let register = (eventHandlers) => {
    eventHandlers = _.mapValues(eventHandlers, handlers => _.map(handlers, handler => handler.bind(this, context)));
    _.mergeWith(window.parent, eventHandlers);
}

let unregister = (eventHandlers) => {
    _.mapKeys(eventHandlers, handler => delete window.parent.handler);
}

export {register, unregister, context}