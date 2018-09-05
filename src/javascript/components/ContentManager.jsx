import React from "react";
import {MuiThemeProvider} from "@material-ui/core";
import {NotificationProvider} from "@jahia/react-material";
import {theme as theme} from "@jahia/react-material/theme";
import {client} from "@jahia/apollo-dx";
import {getI18n} from "@jahia/i18next";
import {I18n, I18nextProvider} from "react-i18next";
import {Route} from "react-router";
import {BrowserRouter} from "react-router-dom";
import {ApolloProvider, ApolloConsumer} from "react-apollo";
import ManagerLayout from "./ManagerLayout";
import CMLeftNavigation from "./CMLeftNavigation";
import CMTopBar from "./CMTopBar";
import * as _ from "lodash";
import {DxContext} from "./DxContext";
import {ContentLayout} from "./ContentLayout";
import defaultActions from "./actions/defaultActions";
import actionsRegistry from "./actionsRegistry"
import CallAction from "./actions/CallAction"
import MenuAction from "./actions/MenuAction";
import RouterAction from "./actions/RouterAction";
import SideMenuAction from "./actions/SideMenuAction";
import {initFontawesomeIcons} from "./icons/initFontawesomeIcons";
import {Routes} from "./Routes";
import constants from "./constants";

const actionComponents = {
    callAction: CallAction,
    menuAction: MenuAction,
    routerAction : RouterAction,
    sideMenuAction : SideMenuAction
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

    // !!this method should never be called but is necessary until BACKLOG-8369 fixed!!
    forceCMUpdate = () => {
        console.warn("update application, this should not happen ..")
        this.forceUpdate();
    }

    setRouter(t, router) {
        let {dxContext, classes} = this.props;
        router && router.history.listen((location, action) => {
            const title = t("label.contentManager.appTitle", {path: location.pathname});
            window.parent.history.replaceState(window.parent.history.state, title, dxContext.contextPath + dxContext.urlBrowser + location.pathname + location.search);
            window.parent.document.title = title;
        });
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
        // register action components
        const isInFrame = window.top !== window;
        let mode = "browse";
        return (
            <MuiThemeProvider theme={theme}>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={client({contextPath: dxContext.contextPath})}>
                        <I18nextProvider i18n={getI18n({
                            lng: dxContext.uilang,
                            contextPath: dxContext.contextPath,
                            ns: dxContext.i18nNamespaces,
                            defaultNS: "content-manager",
                        })}>
                            <I18n>{(t) => {
                                return (
                                    <DxContext.Provider value={dxContext}>
                                        <BrowserRouter basename={dxContext.contextPath + dxContext.urlbase} ref={isInFrame && this.setRouter.bind(this, t)}>
                                            <Route path="/:siteKey/:lang" key={"main-route_" + dxContext.siteKey + "_" + dxContext.lang} render={props => {
                                                dxContext["siteKey"] = props.match.params.siteKey;
                                                dxContext["lang"] = props.match.params.lang;
                                                const currentMode = _.words(props.location.pathname, /[^\/]+/g)[constants.locationModeIndex];
                                                return (
                                                    <ManagerLayout
                                                        header={<CMTopBar dxContext={dxContext} baseRoutePath={props.match.url} mode={currentMode}/>}
                                                        leftSide={<CMLeftNavigation dxContext={dxContext} baseRoutePath={props.match.url}/>}
                                                    >
                                                        <Routes
                                                            basePath={props.match.url}
                                                            browseRender={props =>
                                                                <ContentLayout contentSource="browsing" contentTreeConfigs={[contentTreeConfigs["contents"], contentTreeConfigs["pages"]]} key={"browsing_" + dxContext.siteKey + "_" + dxContext.lang}/>
                                                            }
                                                            browseFilesRender={props =>
                                                                <ContentLayout contentSource="files" contentTreeConfigs={[contentTreeConfigs["files"]]} key={"browse-files_" + dxContext.siteKey + "_" + dxContext.lang}/>
                                                            }
                                                            searchRender={props =>
                                                                <ContentLayout contentSource="search"  key={"search_" + dxContext.siteKey + "_" + dxContext.lang}/>
                                                            }
                                                            sql2SearchRender={props =>
                                                                <ContentLayout contentSource="sql2Search" key={"sql2Search_" + dxContext.siteKey + "_" + dxContext.lang}/>
                                                            }
                                                        />
                                                    </ManagerLayout>
                                                );
                                            }}/>
                                        </BrowserRouter>
                                    </DxContext.Provider>
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