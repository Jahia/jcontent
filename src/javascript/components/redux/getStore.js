import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {languageReducer, siteReducer, modeReducer, pathReducer, paramsReducer, uiLanguageReducer} from "./reducers";
import {connectRouter, routerMiddleware} from "connected-react-router";
import getSyncListener, {extractParamsFromUrl} from './getSyncListener';


let getStore = (dxContext, history) => {
    let currentValueFromUrl = extractParamsFromUrl(history.location.pathname, history.location.search)
    const rootReducer = combineReducers({
        language:languageReducer(currentValueFromUrl.language),
        uiLang:uiLanguageReducer(dxContext),
        site:siteReducer(currentValueFromUrl.site),
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