import React from 'react';
import {AccordionItem, Collections, FolderSpecial, Grain, Page} from '@jahia/moonstone';
import ContentTree from './ContentTree';
import ContentRoute from './ContentRoute';
import AdditionalAppsTree from './AdditionalAppsTree';
import AdditionalAppsRoute from './AdditionalAppsRoute';
import JContentConstants from './JContent.constants';
import {
    ContentQueryHandlerPages,
    ContentQueryHandlerContentFolders,
    FilesQueryHandler,
    SearchQueryHandler, Sql2SearchQueryHandler
} from '~/JContent/ContentRoute/ContentLayout/ContentLayout.gql-queries';
import ContentTypeSelector from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentTypeSelector';
import FileModeSelector from '~/JContent/ContentRoute/ToolBar/FileModeSelector';
import ViewModeSelector from '~/JContent/ContentRoute/ToolBar/ViewModeSelector';

const filesRegex = /\/sites\/[^/]+\/files\/.*/;
const contentsRegex = /\/sites\/[^/]+\/contents\/.*/;

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
        getUrlPathPart,
        getPathForItem: node => {
            return node.ancestors[node.ancestors.length - 1].path;
        },
        queryHandler: ContentQueryHandlerContentFolders
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

    registry.add('accordionItem', 'search', {
        queryHandler: SearchQueryHandler
    });

    registry.add('accordionItem', 'sql2Search', {
        queryHandler: Sql2SearchQueryHandler
    });

    registry.add('accordionItem', 'pages', renderDefaultContentTrees, {
        targets: ['jcontent:50'],
        icon: <Page/>,
        label: 'jcontent:label.contentManager.navigation.pages',
        defaultPath: siteKey => '/sites/' + siteKey,
        getPathForItem: node => {
            const pages = node.ancestors.filter(n => n.primaryNodeType.name === 'jnt:page');
            return pages[pages.length - 1].path;
        },
        canDisplayItem: node => !filesRegex.test(node.path) && !contentsRegex.test(node.path),
        getViewTypeForItem: node => node.primaryNodeType.name === 'jnt:page' ? 'pages' : 'content',
        requiredSitePermission: JContentConstants.accordionPermissions.pagesAccordionAccess,
        config: {
            hideRoot: true,
            rootPath: '',
            selectableTypes: ['jnt:page', 'jnt:virtualsite'],
            type: 'pages',
            openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'],
            rootLabel: 'jcontent:label.contentManager.browsePages',
            key: 'browse-tree-pages'
        },
        queryHandler: ContentQueryHandlerPages,
        viewSelector: <ViewModeSelector/>,
        tableHeader: <ContentTypeSelector/>
    });

    registry.add('accordionItem', 'content-folders', renderDefaultContentTrees, {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'jcontent:label.contentManager.navigation.contentFolders',
        defaultPath: siteKey => '/sites/' + siteKey + '/contents',
        canDisplayItem: node => contentsRegex.test(node.path),
        requiredSitePermission: JContentConstants.accordionPermissions.contentFolderAccordionAccess,
        config: {
            rootPath: '/contents',
            selectableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            type: 'contents',
            openableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            rootLabel: 'jcontent:label.contentManager.browseFolders',
            key: 'browse-tree-content'
        },
        viewSelector: <ViewModeSelector/>
    });

    registry.add('accordionItem', 'media', renderDefaultContentTrees, {
        targets: ['jcontent:70'],
        icon: <Collections/>,
        label: 'jcontent:label.contentManager.navigation.media',
        defaultPath: siteKey => '/sites/' + siteKey + '/files',
        canDisplayItem: node => filesRegex.test(node.path),
        requiredSitePermission: JContentConstants.accordionPermissions.mediaAccordionAccess,
        config: {
            rootPath: '/files',
            selectableTypes: ['jnt:folder'],
            type: 'files',
            openableTypes: ['jnt:folder'],
            rootLabel: 'jcontent:label.contentManager.browseFiles',
            key: 'browse-tree-files'
        },
        queryHandler: FilesQueryHandler,
        viewSelector: <FileModeSelector/>
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
