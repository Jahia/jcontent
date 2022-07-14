import React from 'react';
import {AccordionItem, Collections, Page, FolderSpecial, Grain} from '@jahia/moonstone';
import ContentTree from './ContentTree';
import ContentRoute from './ContentRoute';
import AdditionalAppsTree from './AdditionalAppsTree';
import AdditionalAppsRoute from './AdditionalAppsRoute';
import JContentConstants from './JContent.constants';

export const jContentAccordionItems = registry => {
    const getPath = (site, pathElements, registryItem) => {
        let path = '/sites/' + site + ('/' + pathElements.join('/'));
        if (!path.startsWith('/sites/' + site + registryItem.config.rootPath)) {
            return registryItem.defaultPath(site);
        }

        return path;
    };

    const getUrlPathPart = (site, path) => {
        let sitePath = '/sites/' + site;

        if (path.startsWith(sitePath + '/')) {
            path = path.substring(('/sites/' + site).length);
        } else {
            path = '';
        }

        return path;
    };

    const renderDefaultContentTrees = registry.add('accordionItem', 'renderDefaultContentTrees', {
        render: (v, item) => (
            <AccordionItem key={v.id} id={v.id} label={v.label} icon={v.icon}>
                <ContentTree item={item}/>
            </AccordionItem>
        ),
        routeComponent: ContentRoute,
        getPath,
        getUrlPathPart
    });

    const renderDefaultApps = registry.add('accordionItem', 'renderDefaultApps', {
        render: (v, item) => (
            <AccordionItem key={v.id} id={v.id} label={v.label} icon={v.icon}>
                <AdditionalAppsTree target={item.appsTarget} item={item}/>
            </AccordionItem>
        ),
        routeRender: (v, item) => <AdditionalAppsRoute target={item.appsTarget} match={v.match}/>,
        defaultPath: () => '/'
    });

    registry.add('accordionItem', 'pages', renderDefaultContentTrees, {
        targets: ['jcontent:50'],
        icon: <Page/>,
        label: 'jcontent:label.contentManager.navigation.pages',
        defaultPath: siteKey => '/sites/' + siteKey,
        requiredSitePermission: JContentConstants.accordionPermissions.pagesAccordionAccess,
        config: {
            hideRoot: true,
            rootPath: '',
            selectableTypes: ['jnt:page', 'jnt:virtualsite'],
            type: 'pages',
            openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'],
            rootLabel: 'jcontent:label.contentManager.browsePages',
            key: 'browse-tree-pages'
        }
    });

    registry.add('accordionItem', 'contents', renderDefaultContentTrees, {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'jcontent:label.contentManager.navigation.contentFolders',
        defaultPath: siteKey => '/sites/' + siteKey + '/contents',
        requiredSitePermission: JContentConstants.accordionPermissions.contentFolderAccordionAccess,
        config: {
            rootPath: '/contents',
            selectableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            type: 'contents',
            openableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            rootLabel: 'jcontent:label.contentManager.browseFolders',
            key: 'browse-tree-content'
        }
    });

    registry.add('accordionItem', 'media', renderDefaultContentTrees, {
        targets: ['jcontent:70'],
        icon: <Collections/>,
        label: 'jcontent:label.contentManager.navigation.media',
        defaultPath: siteKey => '/sites/' + siteKey + '/files',
        requiredSitePermission: JContentConstants.accordionPermissions.mediaAccordionAccess,
        config: {
            rootPath: '/files',
            selectableTypes: ['jnt:folder'],
            type: 'files',
            openableTypes: ['jnt:folder'],
            rootLabel: 'jcontent:label.contentManager.browseFiles',
            key: 'browse-tree-files'
        }
    });

    registry.add('accordionItem', 'apps', renderDefaultApps, {
        targets: ['jcontent:80'],
        icon: <Grain/>,
        label: 'jcontent:label.contentManager.navigation.apps.title',
        appsTarget: 'jcontent',
        isEnabled: siteKey => siteKey !== 'systemsite',
        requiredSitePermission: JContentConstants.accordionPermissions.additionalAccordionAccess
    });
};
