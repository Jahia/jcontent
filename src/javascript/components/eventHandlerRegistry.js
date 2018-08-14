import * as _ from "lodash";

const context = {
}

let register = (eventHandlers) => {;
    // register listeners
    eventHandlers = _.mapValues(eventHandlers, handlers => _.map(handlers, handler => handler.bind(this, context)));
    _.mergeWith(window.parent, eventHandlers);
}

export {register, context}