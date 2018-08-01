import React from "react";
import {MuiThemeProvider} from '@material-ui/core';
import {NotificationProvider, theme} from '@jahia/react-material';
import {client} from '@jahia/apollo-dx';
import {getI18n} from '@jahia/i18next';
import {I18nextProvider} from 'react-i18next';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {ApolloProvider} from 'react-apollo';
import ManagerLayout from './ManagerLayout';
import CMLeftNavigation from './CMLeftNavigation';
import CMTopBar from './CMTopBar';
import * as _ from 'lodash';
import {DxContext} from "./DxContext";
import {ContentLayout} from "./ContentLayout";
import {compose} from "react-apollo/index";

import actionsRegistry from "./actionsRegistry"
import Action from "./actions/Action"
import MenuAction from "./actions/MenuAction";

import { initIcons } from './icons/initIcons';

const actionComponents = {
    action: Action,
    menuAction: MenuAction
}


class ContentManager extends React.Component {

    constructor(props) {
        super(props);
        const { dxContext } = props;
        initIcons();
        // register actions
        _.each(Object.keys(dxContext.config.actions), actionKey => {
            actionsRegistry[actionKey] = dxContext.config.actions[actionKey];
            actionsRegistry[actionKey].component = actionComponents[actionsRegistry[actionKey].component];
        });
    }

    setRouter(router) {
        let {dxContext, classes} = this.props;
        router && router.history.listen((location, action) => {
            console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`);
            console.log(`Url base ${dxContext.urlbase}`);
            console.log(`The last navigation action was ${action}`);
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
                            <DxContext.Provider value={dxContext}>
                                <BrowserRouter basename={dxContext.contextPath + dxContext.urlbase} ref={isInFrame && this.setRouter.bind(this)}>
                                    <Route path='/:siteKey/:lang' render={props => {
                                        dxContext['siteKey'] = props.match.params.siteKey;
                                        dxContext['lang'] = props.match.params.lang;

                                        return (
                                            <ManagerLayout header={<CMTopBar dxContext={dxContext}/>} leftSide={<CMLeftNavigation/>}>
                                                <div>
                                                    <Route path={`${props.match.url}/browse`} render={props => (
                                                        <ContentLayout contentSource="browsing" dxContext={dxContext}/>
                                                    )}/>
                                                    <Route path={`${props.match.url}/browse-files`} render={props => (
                                                        <ContentLayout contentSource="files" dxContext={dxContext}/>
                                                    )}/>
                                                    <Route path={`${props.match.url}/search`} render={props => (
                                                        <ContentLayout contentSource="search" dxContext={dxContext}/>
                                                    )}/>
                                                    <Route path={`${props.match.url}/sql2Search`} render={props => (
                                                        <ContentLayout contentSource="sql2Search" dxContext={dxContext}/>
                                                    )}/>
                                                </div>
                                            </ManagerLayout>
                                        )} }/>
                                </BrowserRouter>
                            </DxContext.Provider>
                        </I18nextProvider>
                    </ApolloProvider>
                </NotificationProvider>
            </MuiThemeProvider>
        );
    }
}

export default ContentManager;