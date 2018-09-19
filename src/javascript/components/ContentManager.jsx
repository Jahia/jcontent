import React from "react";
import {MuiThemeProvider} from "@material-ui/core";
import {anthraciteDarkTheme as theme, NotificationProvider} from "@jahia/react-material";
import {client} from "@jahia/apollo-dx";
import {getI18n} from "@jahia/i18next";
import {I18n, I18nextProvider} from "react-i18next";
import {Route} from "react-router";
import {ApolloProvider} from "react-apollo";
import {createBrowserHistory} from "history";
import ManagerLayout from "./ManagerLayout";
import CMLeftNavigation from "./CMLeftNavigation";
import * as _ from "lodash";
import {DxContext} from "./DxContext";
import {ContentLayout} from "./ContentLayout";
import {IFrameLayout} from "./IFrameLayout";
import defaultActions from "./actions/defaultActions";
import actionsRegistry from "./actionsRegistry"
import CallAction from "./actions/CallAction"
import MenuAction from "./actions/MenuAction";
import RouterAction from "./actions/RouterAction";
import SideMenuAction from "./actions/SideMenuAction";
import WorkflowDashboardAction from "./actions/WorkflowDashboardAction";
import {initFontawesomeIcons} from "./icons/initFontawesomeIcons";
import {ConnectedRouter} from 'connected-react-router'
import {Provider} from 'react-redux'
import getStore from './redux/getStore';
import ListAction from "./actions/ListAction";

const actionComponents = {
    callAction: CallAction,
    listAction: ListAction,
    menuAction: MenuAction,
    routerAction : RouterAction,
    sideMenuAction : SideMenuAction,
    workflowDashboardAction : WorkflowDashboardAction
};

class ContentManager extends React.Component {

    constructor(props) {
        super(props);
        const {dxContext} = props;
        window.forceCMUpdate = this.forceCMUpdate.bind(this);
        // test
        initFontawesomeIcons();
        // register actions
        // register actions from the configuration
        const actions = _.merge(dxContext.config.actions, defaultActions);
        _.each(Object.keys(actions), actionKey => {
            actionsRegistry[actionKey] = actions[actionKey];
            // get Component if not set yet
            if (typeof actionsRegistry[actionKey].component === "string") {
                actionsRegistry[actionKey].component = actionComponents[actionsRegistry[actionKey].component]
            }

            // register callbacks (add callback to existing one)
            function customizer(objValue, srcValue) {
                if (_.isArray(objValue)) {
                    return objValue.concat(srcValue);
                }
            }
        });
    }

    getStore = (dxContext, t) => {
        if (!this.store) {
            this.store = getStore(dxContext, this.getHistory(dxContext, t));
        }
        return this.store;
    };

    getHistory = (dxContext, t) => {
        if (!this.history) {
            this.history = createBrowserHistory({basename: dxContext.contextPath + dxContext.urlbase});
            if (window.top !== window) {
                this.history.listen((location, action) => {
                    const title = t("label.contentManager.appTitle", {path: location.pathname});
                    // const title = 'title';
                    window.parent.history.replaceState(window.parent.history.state, title, dxContext.contextPath + dxContext.urlBrowser + location.pathname + location.search);
                    window.parent.document.title = title;
                });
            }
        }
        return this.history;
    };

    // !!this method should never be called but is necessary until BACKLOG-8369 fixed!!
    forceCMUpdate = () => {
        console.warn("update application, this should not happen ..")
        this.forceUpdate();
    }

    render() {
        let contentTreeConfigs = {
            contents: {
                rootPath: "/contents",
                selectableTypes: ['jmix:list'],
                type: "contents",
                openableTypes: ['jmix:list', 'jnt:contentFolder'],
                rootLabel: "label.contentManager.browseFolders",
                key: "browse-tree-content"
            },
            pages: {
                rootPath: "",
                selectableTypes: ['jnt:page'],
                type: "pages",
                openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'],
                rootLabel: "label.contentManager.browsePages",
                key: "browse-tree-pages"
            },
            files: {
                rootPath: "/files",
                selectableTypes: ['jnt:folder'],
                type: "files",
                openableTypes: ['jnt:folder'],
                rootLabel: "label.contentManager.browseFiles",
                key: "browse-tree-files"
            }
        }
        let {dxContext, classes} = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={client({contextPath: dxContext.contextPath, useBatch:true, httpOptions:{batchMax:50}})}>
                        <I18nextProvider i18n={getI18n({
                            lng: dxContext.uilang,
                            contextPath: dxContext.contextPath,
                            ns: dxContext.i18nNamespaces,
                            defaultNS: "content-media-manager",
                        })}>
                            <I18n>{(t) => {
                                return (
                                    <Provider store={this.getStore(dxContext, t)}>
                                        <DxContext.Provider value={dxContext}>
                                            <ConnectedRouter history={this.getHistory(dxContext, t)} >
                                                <Route path="/:siteKey/:lang" render={props => {
                                                    dxContext["lang"] = props.match.params.lang;
                                                    return (
                                                        <ManagerLayout
                                                            leftSide={<CMLeftNavigation/>}
                                                        >
                                                            <Route path={`${props.match.url}/browse`} render={props =>
                                                                <ContentLayout mode={"browse"} contentSource="browsing" contentTreeConfigs={[contentTreeConfigs["contents"], contentTreeConfigs["pages"]]}/>
                                                            }/>
                                                            <Route path={`${props.match.url}/browse-files`} render={props =>
                                                                <ContentLayout mode={"browse-files"} contentSource="files" contentTreeConfigs={[contentTreeConfigs["files"]]}/>
                                                            }/>
                                                            <Route path={`${props.match.url}/search`} render={props =>
                                                                <ContentLayout mode={"search"} contentSource="search"/>
                                                            }/>
                                                            <Route path={`${props.match.url}/sql2Search`} render={props =>
                                                                <ContentLayout mode={"sql2Search"} contentSource="sql2Search"/>
                                                            }/>
                                                            <Route path={`${props.match.url}/apps/:actionKey`} render={props =>
                                                                <IFrameLayout contextPath={dxContext.contextPath} workspace={dxContext.workspace} siteKey={dxContext.siteKey}/>
                                                            }/>
                                                        </ManagerLayout>
                                                    );
                                                }}/>
                                            </ConnectedRouter>
                                        </DxContext.Provider>
                                    </Provider>
                                )}}
                            </I18n>
                        </I18nextProvider>
                    </ApolloProvider>
                </NotificationProvider>
            </MuiThemeProvider>
        );
    }
}

export default ContentManager;