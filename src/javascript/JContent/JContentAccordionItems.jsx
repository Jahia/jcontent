import React from 'react';
import {File, FolderSpecial, Collections, Setting, ViewList} from '@jahia/moonstone/dist/icons';

function jContentAccordionItems(registry) {
    registry.add('accordionItem', 'pages', {
        targets: ['jcontent:50'],
        icon: <File/>,
        label: 'label.contentManager.navigation.pages'
    });

    registry.add('accordionItem', 'content-folders', {
        targets: ['jcontent:60'],
        icon: <FolderSpecial/>,
        label: 'label.contentManager.navigation.contentFolders'
    });

    registry.add('accordionItem', 'media', {
        targets: ['jcontent:70'],
        icon: <Collections/>,
        label: 'label.contentManager.navigation.media'
    });

    registry.add('accordionItem', 'forms', {
        targets: ['jcontent:80'],
        icon: <ViewList/>,
        label: 'label.contentManager.navigation.forms'
    });

    registry.add('accordionItem', 'apps', {
        targets: ['jcontent:90'],
        icon: <Setting/>,
        label: 'label.contentManager.navigation.additional'
    });
}

export default jContentAccordionItems;
