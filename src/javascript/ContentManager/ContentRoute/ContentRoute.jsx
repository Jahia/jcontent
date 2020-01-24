import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, FullWidthContent} from '@jahia/design-system-kit';
import SiteLanguageSwitcher from '../SiteLanguageSwitcher';
import SiteSwitcher from '../SiteSwitcher';
import SearchBar from './ContentLayout/SearchBar';
import ContentLayout from './ContentLayout';

const ContentRoute = ({help, match, t}) => (
    <MainLayout
        topBarProps={{
            path: t('jcontent:label.contentManager.appTitle', {path: ''}),
            title: t('jcontent:label.contentManager.title.' + match.params.mode),
            contextModifiers: <React.Fragment><SiteSwitcher/><SiteLanguageSwitcher/></React.Fragment>,
            actions: <React.Fragment><SearchBar/></React.Fragment>
        }}
        help={help}
    >
        <FullWidthContent>
            <ContentLayout/>
        </FullWidthContent>
    </MainLayout>
);

ContentRoute.propTypes = {
    help: PropTypes.element,
    match: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default ContentRoute;
