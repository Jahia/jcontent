import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {languageReducer, siteReducer} from "./reducers";
import {connectRouter, routerMiddleware} from "connected-react-router";
import getSyncListener from './getSyncListener';


let getStore = (dxContext, history) => {
    const rootReducer = combineReducers({
        language:languageReducer(dxContext),
        site:siteReducer(dxContext)
    });

    const composeEnhancers = window.top.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(
        connectRouter(history)(rootReducer),
        composeEnhancers(
            applyMiddleware(
                routerMiddleware(history)
            ),
        ),
    );

    store.subscribe(getSyncListener(store, history));

    return store;
};

export default getStore;