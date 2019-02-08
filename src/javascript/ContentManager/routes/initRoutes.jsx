import React from 'react';
import {MainLayout, FullWidthLayout} from '@jahia/layouts';
import LanguageSwitcher from '../LanguageSwitcher';
import SiteSwitcher from '../SiteSwitcher';
import IFrameLayout from '../IFrameLayout';
import SearchBar from '../ContentLayout/SearchBar';
import ContentLayout from '../ContentLayout';
import {actionsRegistry} from '@jahia/react-material';

function initRoutes(registry) {
    registry.add('route1', {
        type: 'route',
        target: ['cmm:50'],
        path: '/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext, t}) => (
            <MainLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t([actionsRegistry.get(props.match.params.menu).buttonLabel, 'label.contentManager.leftMenu.manage.title']),
                contextModifiers: <React.Fragment><SiteSwitcher/><LanguageSwitcher/></React.Fragment>,
                actions: <React.Fragment></React.Fragment>
            }}
            >
                <FullWidthLayout>
                    <IFrameLayout
                        contextPath={dxContext.contextPath}
                        workspace={dxContext.workspace}/>
                </FullWidthLayout>
            </MainLayout>
        )
    });

    registry.add('route2', {
        type: 'route',
        target: ['cmm:99'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <MainLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t('label.contentManager.title.' + props.match.params.mode),
                contextModifiers: <React.Fragment><SiteSwitcher/><LanguageSwitcher/></React.Fragment>,
                actions: <SearchBar/>
            }}
            >
                <FullWidthLayout>
                    <ContentLayout/>
                </FullWidthLayout>
            </MainLayout>
        )
    });
}

export default initRoutes;
