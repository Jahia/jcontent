import React from 'react';
import {FullWidthLayout} from '@jahia/layouts';
import LanguageSwitcher from '../LanguageSwitcher';
import SiteSwitcher from '../SiteSwitcher';
import IFrameLayout from '../IFrameLayout';
import SearchBar from '../ContentLayout/SearchBar';
import ContentLayout from '../ContentLayout';

function initRoutes(registry) {
    registry.add('route1', {
        type: 'route',
        target: ['cmm:50'],
        path: '/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext, t}) => (
            <FullWidthLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t('label.contentManager.leftMenu.manage.' + props.match.params.entry + '.title', {path: ''}),
                contextModifiers: <React.Fragment><LanguageSwitcher/><SiteSwitcher/></React.Fragment>,
                actions: <React.Fragment></React.Fragment>
            }}
            >
                <IFrameLayout
                    contextPath={dxContext.contextPath}
                    workspace={dxContext.workspace}/>
            </FullWidthLayout>
        )
    });

    registry.add('route2', {
        type: 'route',
        target: ['cmm:100'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <FullWidthLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t('label.contentManager.title.' + props.match.params.mode),
                contextModifiers: <React.Fragment><LanguageSwitcher/><SiteSwitcher/></React.Fragment>,
                actions: <SearchBar/>
            }}
            >
                <ContentLayout/>
            </FullWidthLayout>
        )
    });
}

export default initRoutes;
