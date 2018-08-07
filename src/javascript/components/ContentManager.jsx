import React from "react";
import {MuiThemeProvider} from '@material-ui/core';
import {NotificationProvider, theme} from '@jahia/react-material';
import {client} from '@jahia/apollo-dx';
import {getI18n} from '@jahia/i18next';
import {I18nextProvider} from 'react-i18next';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {ApolloProvider, ApolloConsumer} from 'react-apollo';
import ManagerLayout from './ManagerLayout';
import CMLeftNavigation from './CMLeftNavigation';
import CMTopBar from './CMTopBar';
import * as _ from 'lodash';
import {DxContextProvider, DxContextConsumer} from "./DxContext";
import {ContentLayout} from "./ContentLayout";
import defaultActions from "./actions/defaultActions"
import actionsRegistry from "./actionsRegistry"
import Action from "./actions/Action"
import MenuAction from "./actions/MenuAction";

import {initFontawesomeIcons} from './icons/initFontawesomeIcons';
import GWTExternalEventsHandlers from "./GWTExternalEventsHandlers";

const actionComponents = {
    action: Action,
    menuAction: MenuAction
}

class ContentManager extends React.Component {

    constructor(props) {
        super(props);
        const {dxContext} = props;
        initFontawesomeIcons();
        // register actions
        // register actions from the configuration
        const actions = _.merge(dxContext.config.actions, defaultActions);
        _.each(Object.keys(actions), actionKey => {
            actionsRegistry[actionKey] = actions[actionKey];
            // get Component if not set yet
            if (typeof  actionsRegistry[actionKey].component === 'string') {
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

    setRouter(router) {
        let {dxContext, classes} = this.props;
        router && router.history.listen((location, action) => {
            window.parent.history.replaceState(window.parent.history.state, "DX Content Manager " + location.pathname, dxContext.contextPath + dxContext.urlBrowser + location.pathname + location.search);
        });
    }

    render() {

        let {dxContext, classes} = this.props;
        // register action components
        const isInFrame = window.top !== window;
        return (
            <MuiThemeProvider theme={theme}>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={client({contextPath: dxContext.contextPath})}>
                        <I18nextProvider i18n={getI18n({
                            lng: dxContext.uilang,
                            contextPath: dxContext.contextPath,
                            ns: ['content-manager'],
                            defaultNS: 'content-manager',
                        })}>
                            <ApolloConsumer>
                                {apolloClient =>
                                    <DxContextProvider dxContext={dxContext} apolloClient={apolloClient}>
                                        <DxContextConsumer>{dxContext => (
                                            <BrowserRouter basename={dxContext.contextPath + dxContext.urlbase} ref={isInFrame && this.setRouter.bind(this)}>
                                                <Route path='/:siteKey/:lang' render={props => {
                                                    dxContext.onRouteChanged(props.location, props.match);
                                                    dxContext.gwtExternalEventsHandlers =  new GWTExternalEventsHandlers(apolloClient)
                                                    return (
                                                        <ManagerLayout header={<CMTopBar dxContext={dxContext}/>}
                                                                       leftSide={<CMLeftNavigation/>}>
                                                            <div>
                                                                <Route path={`${props.match.url}/browse`} render={props => (
                                                                    <ContentLayout contentSource="browsing" lang={dxContext.lang}/>
                                                                )}/>
                                                                <Route path={`${props.match.url}/browse-files`} render={props => (
                                                                    <ContentLayout contentSource="files" lang={dxContext.lang}/>
                                                                )}/>
                                                                <Route path={`${props.match.url}/search`} render={props => (
                                                                    <ContentLayout contentSource="search" lang={dxContext.lang}/>
                                                                )}/>
                                                                <Route path={`${props.match.url}/sql2Search`} render={props => (
                                                                    <ContentLayout contentSource="sql2Search" lang={dxContext.lang}/>
                                                                )}/>
                                                            </div>
                                                        </ManagerLayout>
                                                    )
                                                }}/>
                                            </BrowserRouter>
                                        )}</DxContextConsumer>
                                    </DxContextProvider>
                                }
                            </ApolloConsumer>
                        </I18nextProvider>
                    </ApolloProvider>
                </NotificationProvider>
            </MuiThemeProvider>
        );
    }
}

export default ContentManager;