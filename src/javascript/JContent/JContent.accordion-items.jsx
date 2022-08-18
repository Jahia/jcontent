import React from 'react';
import {AccordionItem, Collections, FolderSpecial, Grain, Page} from '@jahia/moonstone';
import ContentTree from './ContentTree';
import ContentRoute from './ContentRoute';
import AdditionalAppsTree from './AdditionalAppsTree';
import AdditionalAppsRoute from './AdditionalAppsRoute';
import JContentConstants from './JContent.constants';
import ContentTypeSelector from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentTypeSelector';
import FileModeSelector from '~/JContent/ContentRoute/ToolBar/FileModeSelector';
import ViewModeSelector from '~/JContent/ContentRoute/ToolBar/ViewModeSelector';
import {PagesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/PagesQueryHandler';
import {
    ContentFoldersQueryHandler
} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/ContentFoldersQueryHandler';
import {FilesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/FilesQueryHandler';
import {SearchQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/SearchQueryHandler';
import {Sql2SearchQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/Sql2SearchQueryHandler';

const filesRegex = /^\/sites\/[^/]+\/files\/.*/;
const contentsRegex = /^\/sites\/[^/]+\/contents\/.*/;
const contentFolderRegex = /^\/sites\/[^/]+\/contents((\/.*)|$)/;
const folderRegex = /^\/sites\/[^/]+\/files((\/.*)|$)/;
const everythingUnderSitesRegex = /^\/sites\/.*/;

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
        queryHandler: ContentFoldersQueryHandler
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
            const pages = node.ancestors
                .filter(n => n.primaryNodeType.name === 'jnt:page');
            return pages[pages.length - 1].path;
        },
        canDisplayItem: ({selectionNode, folderNode}) =>
            selectionNode ? everythingUnderSitesRegex.test(selectionNode.path) && 
                !filesRegex.test(selectionNode.path) &&
                !contentsRegex.test(selectionNode.path) :
                everythingUnderSitesRegex.test(folderNode.path) &&
                !folderRegex.test(folderNode.path) &&
                !contentFolderRegex.test(folderNode.path),
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
        queryHandler: PagesQueryHandler,
        viewSelector: <ViewModeSelector/>,
        tableHeader: <ContentTypeSelector/>
    });

    registry.add('accordionItem', 'content-folders', renderDefaultContentTrees, {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'jcontent:label.contentManager.navigation.contentFolders',
        defaultPath: siteKey => '/sites/' + siteKey + '/contents',
        canDisplayItem: ({selectionNode, folderNode}) => selectionNode ? contentsRegex.test(selectionNode.path) : contentFolderRegex.test(folderNode.path),
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
        canDisplayItem: ({selectionNode, folderNode}) => selectionNode ? filesRegex.test(selectionNode.path) : folderRegex.test(folderNode.path),
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
