import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, FullWidthContent} from '@jahia/design-system-kit';
import SiteLanguageSwitcher from '../SiteLanguageSwitcher';
import SiteSwitcher from '../SiteSwitcher';
import IFrameLayout from './IFrameLayout';
import {actionsRegistry} from '@jahia/react-material';

const AppRoute = ({dxContext, match, t}) => (
    <MainLayout
        topBarProps={{
            path: t('jcontent:label.contentManager.appTitle', {path: ''}),
            title: t([actionsRegistry.get(match.params.menu).buttonLabel, 'jcontent:label.contentManager.leftMenu.manage.title']),
            contextModifiers: <React.Fragment><SiteSwitcher/> <SiteLanguageSwitcher/></React.Fragment>,
            actions: <React.Fragment></React.Fragment>
        }}
    >
        <FullWidthContent>
            <IFrameLayout
                contextPath={dxContext.contextPath}
                workspace={dxContext.workspace}/>
        </FullWidthContent>
    </MainLayout>
);

AppRoute.propTypes = {
    dxContext: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default AppRoute;
