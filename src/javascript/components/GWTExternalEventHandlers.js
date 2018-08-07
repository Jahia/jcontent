import * as _ from "lodash";

class GWTExternalEventHandlers {

    context = {
    }

    constructor(apolloClient, uiLang) {
        this.context.apolloClient = apolloClient;
        this.context.uiLang = uiLang;
    }

    register(eventHandlers) {;
        // register listeners
        eventHandlers = _.mapValues(eventHandlers, handlers => _.map(handlers, handler => handler.bind(this, this.context)));
        _.mergeWith(window.parent, eventHandlers);
    }

    setContext(path, goto, params, language) {
        this.context.path = path;
        this.context.goto = goto;
        this.context.params = params;
        this.context.language = language;
    }
}

// register method to reset store


export default GWTExternalEventHandlers;