import React from 'react';
import {File, FolderSpecial, Collections, Setting} from '@jahia/moonstone/dist/icons';
import ContentTrees from './ContentRoute/ContentLayout/ContentTrees/ContentTrees';
import JContentConstants from './JContent.constants';

function jContentAccordionItems(registry) {
    registry.add('accordionItem', JContentConstants.mode.PAGES, {
        targets: ['jcontent:50'],
        icon: <File/>,
        label: 'label.contentManager.navigation.pages',
        render: () => (
            <ContentTrees contentTreeConfigs={[{
                rootPath: '',
                selectableTypes: ['jnt:page', 'jnt:virtualsite'],
                type: 'pages',
                openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'],
                rootLabel: 'jcontent:label.contentManager.browsePages',
                key: 'browse-tree-pages'
            }]}/>
        )
    });

    registry.add('accordionItem', JContentConstants.mode.CONTENT_FOLDERS, {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'label.contentManager.navigation.contentFolders',
        render: () => (
            <ContentTrees contentTreeConfigs={[{
                rootPath: '/contents',
                selectableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
                type: 'contents',
                openableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
                rootLabel: 'jcontent:label.contentManager.browseFolders',
                key: 'browse-tree-content'
            }]}/>
        )
    });

    registry.add('accordionItem', JContentConstants.mode.MEDIA, {
        targets: ['jcontent:70'],
        icon: <Collections/>,
        label: 'label.contentManager.navigation.media',
        render: () => (
            <ContentTrees contentTreeConfigs={[{
                rootPath: '/files',
                selectableTypes: ['jnt:folder'],
                type: 'files',
                openableTypes: ['jnt:folder'],
                rootLabel: 'jcontent:label.contentManager.browseFiles',
                key: 'browse-tree-files'
            }]}/>
        )
    });

    registry.add('accordionItem', JContentConstants.mode.APPS, {
        targets: ['jcontent:80'],
        icon: <Setting/>,
        label: 'label.contentManager.navigation.apps',
        render: () => <div>HELLO</div>
    });
}

export default jContentAccordionItems;
