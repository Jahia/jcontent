import React from "react";
import {MuiThemeProvider} from '@material-ui/core';
import {NotificationProvider, theme} from '@jahia/react-material';
import {client} from '@jahia/apollo-dx';
import {getI18n} from '@jahia/i18next';
import {I18nextProvider} from 'react-i18next';
import {Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {ApolloProvider} from 'react-apollo';
import ContentBrowser from './ContentBrowser';
import ManagerLayout from './ManagerLayout';
import CMLeftNavigation from './CMLeftNavigation';
import CMTopBar from './CMTopBar';
import * as _ from 'lodash';
import {ContentLayout} from "./ContentLayout";

class ContentManager extends React.Component {

    setRouter(router) {
        let {dxContext, classes} = this.props;
        if (router) {
            router.history.listen((location, action) => {
                console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`);
                console.log(`Url base ${dxContext.urlbase}`);
                console.log(`The last navigation action was ${action}`);
                if (window.parent) {
                    window.parent.history.replaceState(window.parent.history.state, dxContext.contextPath + dxContext.urlBrowser + location.pathname, dxContext.contextPath + dxContext.urlBrowser + location.pathname)
                }
            });
        }
    }

    render() {
        let {dxContext, classes} = this.props;

        const isInFrame = !_.startsWith(window.parent.location.pathname, dxContext.contextPath + dxContext.urlbase);

        return (<MuiThemeProvider theme={theme}>
                <NotificationProvider notificationContext={{}}>
                    <ApolloProvider client={client({contextPath: this.props.dxContext.contextPath})}>
                        <I18nextProvider i18n={getI18n({
                            lng: this.props.dxContext.uilang,
                            contextPath: this.props.dxContext.contextPath,
                            ns: ['content-manager'],
                            defaultNS: 'content-manager',
                        })}>
                            <BrowserRouter basename={dxContext.contextPath + dxContext.urlbase}
                                           ref={isInFrame && this.setRouter.bind(this)}>
                                <ManagerLayout header={<CMTopBar/>} leftSide={<CMLeftNavigation/>}>
                                    <Route path='/*' component={ContentLayout}/>
                                </ManagerLayout>
                            </BrowserRouter>
                        </I18nextProvider>
                    </ApolloProvider>
                </NotificationProvider>
            </MuiThemeProvider>
        );
    }
}

export default ContentManager;