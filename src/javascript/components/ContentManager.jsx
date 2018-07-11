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

class ContentManager extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            sql2Search: {
                from: "",
                where: "",
                orderBy: ""
            }
        };
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

    onSql2Search = (from, where, orderBy) => {
        this.setState({
            sql2Search: {
                from: from,
                where: where,
                orderBy: orderBy
            }
        });
    }

    render() {

        let {dxContext, classes} = this.props;
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
                                    <ManagerLayout header={<CMTopBar dxContext={dxContext} sql2SearchProps={_.assign({onSearch: this.onSql2Search}, this.state.sql2Search)}/>} leftSide={<CMLeftNavigation/>}>
                                        <Route path='/*' render={props => (
                                            <ContentLayout lang={dxContext.lang} uiLang={dxContext.uilang} sitePath={'/sites/' + dxContext.siteKey}/>
                                        )}/>
                                    </ManagerLayout>
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