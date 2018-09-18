import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {
    languageReducer,
    siteReducer,
    modeReducer,
    pathReducer,
    paramsReducer,
    uiLanguageReducer,
    selectionReducer
} from "./reducers";
import {connectRouter, routerMiddleware} from "connected-react-router";
import getSyncListener, {extractParamsFromUrl} from './getSyncListener';


let getStore = (dxContext, history) => {
    let currentValueFromUrl = extractParamsFromUrl(history.location.pathname, history.location.search)
    const rootReducer = combineReducers({
        uiLang:uiLanguageReducer(dxContext),
        selection:selectionReducer,
        site:siteReducer(currentValueFromUrl.site),
        language:languageReducer(currentValueFromUrl.language),
        mode:modeReducer(currentValueFromUrl.mode),
        path:pathReducer(currentValueFromUrl.path),
        params:paramsReducer(currentValueFromUrl.params),
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