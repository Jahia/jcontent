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
        target: ['cmm:1'],
        path: '/:siteKey/:lang/apps',
        render: (props, {dxContext}) => (
            <FullWidthLayout topBarProps={{
                title: 'Site settings',
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
        target: ['cmm:2'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <FullWidthLayout topBarProps={{
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
