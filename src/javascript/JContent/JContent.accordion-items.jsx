import React from 'react';
import {AccordionItem, Collections, FolderSpecial, Grain, Page, Palette, Tag} from '@jahia/moonstone';
import ContentTree from './ContentTree';
import ContentRoute from './ContentRoute';
import AdditionalAppsTree from './AdditionalAppsTree';
import AdditionalAppsRoute from './AdditionalAppsRoute';
import JContentConstants from './JContent.constants';
import {ContentTypeSelector} from '~/JContent/ContentRoute/ContentLayout/ContentTable/ContentTypeSelector';
import FileModeSelector from '~/JContent/ContentRoute/ToolBar/FileModeSelector';
import ViewModeSelector from '~/JContent/ContentRoute/ToolBar/ViewModeSelector';
import {PagesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/PagesQueryHandler';
import {SamplesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/SamplesQueryHandler';
import {SAMPLES_CATEGORY_TYPE} from '~/JContent/samples';
import {
    ContentFoldersQueryHandler
} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/ContentFoldersQueryHandler';
import {FilesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/FilesQueryHandler';
import {SearchQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/SearchQueryHandler';
import {Sql2SearchQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/Sql2SearchQueryHandler';
import {SORT_CONTENT_TREE_BY_NAME_ASC} from '~/JContent/ContentTree/ContentTree.constants';
import {booleanValue, isSamplePath} from '~/JContent/JContent.utils';
import {mediaColumnData} from '~/JContent/ContentRoute/ContentLayout/ContentTable/reactTable/columns';
import {
    DeletionInfoQueryHandler
} from '~/JContent/actions/deleteActions/Delete/InfoTable/queryHandlers/DeletionInfoQueryHandler';
import {CategoriesQueryHandler} from '~/JContent/ContentRoute/ContentLayout/queryHandlers/CategoriesQueryHandler';
import CategoriesRoute from '~/JContent/CategoriesRoute/CategoriesRoute';
import SortSelector from '~/JContent/ContentRoute/ToolBar/SortSelector';

const filesRegex = /^\/sites\/[^/]+\/files\/.*/;
const contentsRegex = /^\/sites\/[^/]+\/contents\/.*/;
const contentFolderRegex = /^\/sites\/[^/]+\/contents((\/.*)|$)/;
const folderRegex = /^\/sites\/[^/]+\/files((\/.*)|$)/;
const everythingUnderSitesRegex = /^\/sites\/.*/;

export const jContentAccordionItems = registry => {
    const showPageBuilder = booleanValue(contextJsParameters.config.jcontent?.showPageBuilder);

    const renderDefaultContentTrees = registry.add('accordionItem', 'renderDefaultContentTrees', {
        render: (v, item) => (
            <AccordionItem key={v.id} {...v}>
                <ContentTree item={item} contextualMenuAction="accordionContentMenu"/>
            </AccordionItem>
        ),
        routeComponent: ContentRoute,
        getPath(site, pathElements) {
            let path = '/sites/' + site + ('/' + pathElements.join('/'));
            if (!path.startsWith(this.getRootPath(site))) {
                return this.getRootPath(site);
            }

            return path;
        },
        getRootPath(site) {
            return this.rootPath.replace('{site}', site);
        },
        getUrlPathPart(site, path) {
            let sitePath = '/sites/' + site;

            if (path.startsWith(sitePath + '/')) {
                path = path.substring(('/sites/' + site).length);
            } else {
                path = '';
            }

            return path;
        },
        getPathForItem(node) {
            return node.ancestors[node.ancestors.length - 1]?.path;
        },
        rootPath: '/sites/{site}',
        tableConfig: {
            queryHandler: ContentFoldersQueryHandler,
            typeFilter: ['jnt:content'],
            uploadType: JContentConstants.mode.IMPORT
        }
    });

    const renderDefaultApps = registry.add('accordionItem', 'renderDefaultApps', {
        render: (v, item) => (
            <AccordionItem key={v.id} {...v}>
                <AdditionalAppsTree target={item.appsTarget} item={item}/>
            </AccordionItem>
        ),
        routeRender: (v, item) => <AdditionalAppsRoute target={item.appsTarget} mode={item.key} match={v.match}/>,
        getRootPath(site) {
            return this.rootPath.replace('{site}', site);
        },
        rootPath: '/'
    });

    registry.add('accordionItem', 'search', {
        tableConfig: {
            queryHandler: SearchQueryHandler,
            availableModes: ['flatList']
        }
    });

    registry.add('accordionItem', 'sql2Search', {
        tableConfig: {
            queryHandler: Sql2SearchQueryHandler,
            availableModes: ['flatList']
        }
    });

    const canDragDrop = () => {
        let tableView = window.jahia.reduxStore.getState().jcontent.tableView;
        let pages = showPageBuilder && tableView.viewType === JContentConstants.tableView.viewType.PAGES;
        let structuredContent = tableView.viewMode === JContentConstants.tableView.viewMode.STRUCTURED && tableView.viewType === JContentConstants.tableView.viewType.CONTENT;
        return pages || structuredContent;
    };

    registry.add('accordionItem', 'pages', renderDefaultContentTrees, {
        targets: ['jcontent:50'],
        icon: <Page/>,
        label: 'jcontent:label.contentManager.navigation.pages',
        isEnabled: siteKey => siteKey !== 'systemsite',
        rootPath: '/sites/{site}',
        routeComponent: ContentRoute,
        getPathForItem: node => {
            const pages = node.ancestors
                .filter(n => n.primaryNodeType.name === 'jnt:page');
            return pages[pages.length - 1]?.path || node.site.path;
        },
        canDisplayItem: ({selectionNode, folderNode}) =>
            selectionNode ? everythingUnderSitesRegex.test(selectionNode.path) &&
                !filesRegex.test(selectionNode.path) &&
                !contentsRegex.test(selectionNode.path) &&
                !isSamplePath(selectionNode.path) :
                everythingUnderSitesRegex.test(folderNode.path) &&
                !folderRegex.test(folderNode.path) &&
                !contentFolderRegex.test(folderNode.path) &&
                !isSamplePath(folderNode.path),
        getViewTypeForItem: node => node.primaryNodeType.name === 'jnt:page' ? 'pages' : 'content',
        requiredSitePermission: JContentConstants.accordionPermissions.pagesAccordionAccess,
        treeConfig: {
            hideRoot: true,
            selectableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:externalLink', 'jnt:nodeLink', 'jnt:navMenuText', 'jmix:visibleInPagesTree'],
            openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText', 'jmix:visibleInPagesTree'],
            rootLabel: 'jcontent:label.contentManager.browsePages',
            dnd: {
                canDrag: showPageBuilder, canDrop: showPageBuilder, canReorder: showPageBuilder
            },
            showContextMenuOnRootPath: booleanValue(contextJsParameters.config.jcontent?.showPageBuilder)
        },
        tableConfig: {
            defaultViewMode: 'pageBuilder',
            queryHandler: PagesQueryHandler,
            viewSelector: <ViewModeSelector/>,
            tableHeader: <ContentTypeSelector/>,
            dnd: {
                canDrag: canDragDrop, canDrop: canDragDrop, canDropFile: canDragDrop
            }
        }
    });

    registry.add('accordionItem', 'content-folders', renderDefaultContentTrees, {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'jcontent:label.contentManager.navigation.contentFolders',
        rootPath: '/sites/{site}/contents',
        canDisplayItem: ({selectionNode, folderNode}) => selectionNode ? contentsRegex.test(selectionNode.path) : contentFolderRegex.test(folderNode.path),
        requiredSitePermission: JContentConstants.accordionPermissions.contentFolderAccordionAccess,
        treeConfig: {
            selectableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            openableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            rootLabel: 'jcontent:label.contentManager.browseFolders',
            sortBy: SORT_CONTENT_TREE_BY_NAME_ASC,
            dnd: {
                canDrag: true, canDrop: true, canDropFile: true
            }
        },
        tableConfig: {
            queryHandler: ContentFoldersQueryHandler,
            typeFilter: ['jnt:content'],
            viewSelector: <ViewModeSelector/>,
            uploadType: JContentConstants.mode.IMPORT,
            dnd: {
                canDrag: true, canDrop: true, canDropFile: true
            }
        }
    });

    registry.add('accordionItem', 'media', renderDefaultContentTrees, {
        targets: ['jcontent:70'],
        icon: <Collections/>,
        label: 'jcontent:label.contentManager.navigation.media',
        rootPath: '/sites/{site}/files',
        canDisplayItem: ({selectionNode, folderNode}) => selectionNode ? filesRegex.test(selectionNode.path) : folderRegex.test(folderNode.path),
        requiredSitePermission: JContentConstants.accordionPermissions.mediaAccordionAccess,
        treeConfig: {
            selectableTypes: ['jnt:folder'],
            openableTypes: ['jnt:folder'],
            rootLabel: 'jcontent:label.contentManager.browseFiles',
            sortBy: SORT_CONTENT_TREE_BY_NAME_ASC,
            dnd: {
                canDrag: true, canDrop: true, canDropFile: true
            }
        },
        tableConfig: {
            queryHandler: FilesQueryHandler,
            columns: mediaColumnData,
            typeFilter: ['jnt:file', 'jnt:folder'],
            viewSelector: <FileModeSelector/>,
            sortSelector: <SortSelector/>,
            uploadType: JContentConstants.mode.UPLOAD,
            dnd: {
                canDrag: true, canDrop: true, canDropFile: true
            }
        }
    });

    // Content samples: site content kept as filled, previewable examples of a content type.
    // They sit flat under the two categories the samples root declares - pages and components -
    // because a component renders on its own as a module and borrows its CSS from a page named at
    // render time, so nothing has to be wrapped in a page to be previewable. Browsing them looks
    // like the Pages accordion, but they stay a separate surface: their own permission, and no
    // publication at all, since the /sites/<site>/samples root is a jnt:samplesFolder and so
    // jmix:nolive.
    registry.add('accordionItem', 'samples', renderDefaultContentTrees, {
        targets: ['jcontent:75'],
        icon: <Palette/>,
        label: 'jcontent:label.contentManager.navigation.samples',
        isEnabled: siteKey => siteKey !== 'systemsite',
        rootPath: '/sites/{site}/samples',
        canDisplayItem: ({selectionNode, folderNode}) => isSamplePath(selectionNode ? selectionNode.path : folderNode.path),
        getPathForItem: node => {
            // Samples are stored flat, so a component sample normally has no page ancestor at all -
            // the category holding it is what should open. Content saved along with a page sample
            // does have one, and ancestors run root-first, so the nearest container wins either way.
            const containers = node.ancestors.filter(n =>
                n.primaryNodeType.name === 'jnt:page' || n.primaryNodeType.name === SAMPLES_CATEGORY_TYPE);
            return containers[containers.length - 1]?.path || `${node.site.path}/samples`;
        },
        getViewTypeForItem: node => node.primaryNodeType.name === 'jnt:page' ? 'pages' : 'content',
        requiredSitePermission: JContentConstants.accordionPermissions.samplesAccordionAccess,
        treeConfig: {
            selectableTypes: ['jnt:samplesFolder', 'jnt:samplesCategory', 'jnt:page'],
            openableTypes: ['jnt:samplesFolder', 'jnt:samplesCategory', 'jnt:page'],
            rootLabel: 'jcontent:label.contentManager.browseSamples',
            sortBy: SORT_CONTENT_TREE_BY_NAME_ASC,
            // Samples are reused by copying, never by moving: dragging one out of the branch would
            // take the original away from every other author.
            dnd: {
                canDrag: false, canDrop: false, canReorder: false
            }
        },
        tableConfig: {
            queryHandler: SamplesQueryHandler,
            typeFilter: ['jnt:samplesCategory', 'jnt:content', 'jnt:page'],
            dnd: {
                canDrag: false, canDrop: false, canDropFile: false
            }
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

    registry.add('accordionItem', 'deletionInfo', {
        tableConfig: {
            queryHandler: DeletionInfoQueryHandler
        }
    });

    registry.add('accordionItem', 'category', renderDefaultContentTrees, {
        targets: ['category-manager:1'],
        icon: <Tag/>,
        label: 'Categories',
        rootPath: '/sites/systemsite/categories',
        render: (v, item) => (
            <AccordionItem key={v.id} {...v}>
                <ContentTree item={item}
                             contextualMenuAction="accordionContentMenu"
                             pageTitlePrefix="jcontent:label.categoryManager.pageTitle"
                             selector={state => ({
                                 siteKey: 'systemsite',
                                 lang: state.language,
                                 path: state.jcontent.path,
                                 mode: state.jcontent.mode,
                                 openPaths: state.jcontent.openPaths,
                                 viewMode: JContentConstants.tableView.viewMode.FLAT
                             })}
                />
            </AccordionItem>
        ),
        routeComponent: CategoriesRoute,
        canDisplayItem: ({selectionNode, folderNode}) => selectionNode ? /^\/sites\/systemsite\/categories\/.*/.test(selectionNode.path) : /^\/sites\/systemsite\/categories((\/.*)|$)/.test(folderNode.path),
        getUrlPathPart(site, path) {
            let sitePath = '/sites/systemsite/categories';

            if (path.startsWith(sitePath + '/')) {
                path = path.substring(sitePath.length);
            } else {
                path = '/';
            }

            return path;
        },
        requiredSitePermission: undefined,
        treeConfig: {
            selectableTypes: ['jnt:category'],
            openableTypes: ['jnt:category'],
            rootLabel: 'Categories',
            sortBy: SORT_CONTENT_TREE_BY_NAME_ASC,
            dnd: {
                canDrag: true, canDrop: true, canDropFile: false
            }
        },
        tableConfig: {
            queryHandler: CategoriesQueryHandler,
            typeFilter: ['jnt:category'],
            viewSelector: undefined,
            uploadType: JContentConstants.mode.IMPORT,
            dnd: {
                canDrag: true, canDrop: true, canDropFile: true
            },
            defaultSort: {orderBy: 'displayName', order: 'ASC'},
            columns: ['name']
        }
    });
};
