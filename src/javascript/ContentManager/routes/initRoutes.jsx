import React from 'react';
import {MainLayout, FullWidthContent} from '@jahia/layouts';
import LanguageSwitcher from '../LanguageSwitcher';
import SiteSwitcher from '../SiteSwitcher';
import IFrameLayout from '../IFrameLayout';
import SearchBar from '../ContentLayout/SearchBar';
import ContentLayout from '../ContentLayout';
import ImageEditor from '../ImageEditor';
import {actionsRegistry} from '@jahia/react-material';

function initRoutes(registry) {
    registry.add('app-route', {
        type: 'route',
        target: ['cmm:50'],
        path: '/:siteKey/:lang/apps/:menu/:entry',
        render: (props, {dxContext, t}) => (
            <MainLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t([actionsRegistry.get(props.match.params.menu).buttonLabel, 'label.contentManager.leftMenu.manage.title']),
                contextModifiers: <React.Fragment><SiteSwitcher/> <LanguageSwitcher/></React.Fragment>,
                actions: <React.Fragment></React.Fragment>
            }}
            >
                <FullWidthContent>
                    <IFrameLayout
                        contextPath={dxContext.contextPath}
                        workspace={dxContext.workspace}/>
                </FullWidthContent>
            </MainLayout>
        )
    });

    registry.add('image-edit-route', {
        target: ['cmm:60'],
        type: 'route',
        path: '/:siteKey/:lang/image-edit',
        render: props => (
            <ImageEditor {...props}/>
        )
    });

    registry.add('cmm-default-route', {
        type: 'route',
        target: ['cmm:99'],
        path: '/:siteKey/:lang/:mode',
        render: (props, {t}) => (
            <MainLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t('label.contentManager.title.' + props.match.params.mode),
                contextModifiers: <React.Fragment><SiteSwitcher/><LanguageSwitcher/></React.Fragment>,
                actions: <React.Fragment><SearchBar/></React.Fragment>
            }}
            >
                <FullWidthContent>
                    <ContentLayout/>
                </FullWidthContent>
            </MainLayout>
        )
    });
}

export default initRoutes;
