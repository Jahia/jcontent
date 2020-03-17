import React from 'react';
import {Collections, File, FolderSpecial, Setting} from '@jahia/moonstone/dist/icons';
import ContentTree from './ContentTree';
import JContentConstants from './JContent.constants';
import AdditionalApps from './AdditionalApps';

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
        render: item => (
            <ContentTree item={item}/>
        ),
        getPath,
        getUrlPathPart
    });

    registry.add('accordionItem', JContentConstants.mode.PAGES, renderDefaultContentTrees, {
        targets: ['jcontent:50'],
        icon: <File/>,
        label: 'label.contentManager.navigation.pages',
        defaultPath: siteKey => '/sites/' + siteKey,
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

    registry.add('accordionItem', JContentConstants.mode.CONTENT_FOLDERS, renderDefaultContentTrees, {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'label.contentManager.navigation.contentFolders',
        defaultPath: siteKey => '/sites/' + siteKey + '/contents',
        config: {
            rootPath: '/contents',
            selectableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            type: 'contents',
            openableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            rootLabel: 'jcontent:label.contentManager.browseFolders',
            key: 'browse-tree-content'
        }
    });

    registry.add('accordionItem', JContentConstants.mode.MEDIA, renderDefaultContentTrees, {
        targets: ['jcontent:70'],
        icon: <Collections/>,
        label: 'label.contentManager.navigation.media',
        defaultPath: siteKey => '/sites/' + siteKey + '/files',
        config: {
            rootPath: '/files',
            selectableTypes: ['jnt:folder'],
            type: 'files',
            openableTypes: ['jnt:folder'],
            rootLabel: 'jcontent:label.contentManager.browseFiles',
            key: 'browse-tree-files'
        }
    });

    registry.add('accordionItem', JContentConstants.mode.APPS, {
        targets: ['jcontent:80'],
        icon: <Setting/>,
        label: 'label.contentManager.navigation.apps',
        defaultPath: () => {
            const availableRoutes = registry.find({type: 'adminRoute', target: 'jcontent'});
            return '/' + availableRoutes[0].key;
        },
        render: () => (
            <AdditionalApps/>
        ),
        getPath: getPath,
        config: {
            rootPath: ''
        }
    });
};
