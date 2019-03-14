import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, FullWidthContent} from '@jahia/layouts';
import LanguageSwitcher from '../LanguageSwitcher';
import SiteSwitcher from '../SiteSwitcher';
import SearchBar from './ContentLayout/SearchBar';
import ContentLayout from './ContentLayout';

const ContentRoute = ({help, match, t}) => (
    <MainLayout
        topBarProps={{
            path: t('label.contentManager.appTitle', {path: ''}),
            title: t('label.contentManager.title.' + match.params.mode),
            contextModifiers: <React.Fragment><SiteSwitcher/><LanguageSwitcher/></React.Fragment>,
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
    help: PropTypes.element.isRequired,
    match: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};

export default ContentRoute;
