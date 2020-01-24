const JContentConstants = {
    contentType: 'jmix:editorialContent',
    maxCreateContentOfTypeDirectItems: 5,
    availablePublicationStatuses: {
        PUBLISHED: 'PUBLISHED',
        MODIFIED: 'MODIFIED',
        NOT_PUBLISHED: 'NOT_PUBLISHED',
        MARKED_FOR_DELETION: 'MARKED_FOR_DELETION',
        UNPUBLISHED: 'UNPUBLISHED',
        MANDATORY_LANGUAGE_UNPUBLISHABLE: 'MANDATORY_LANGUAGE_UNPUBLISHABLE',
        MANDATORY_LANGUAGE_VALID: 'MANDATORY_LANGUAGE_VALID',
        CONFLICT: 'CONFLICT'
    },
    browsingPathByType: {
        contents: 'browse',
        pages: 'browse',
        files: 'browse-files'
    },
    locationModeIndex: 2,
    mode: {
        BROWSE: 'browse',
        FILES: 'browse-files',
        SEARCH: 'search',
        SQL2SEARCH: 'sql2Search',
        LIST: 'list',
        GRID: 'grid'
    },
    contentTreeConfigs: {
        contents: {
            rootPath: '/contents',
            selectableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            type: 'contents',
            openableTypes: ['jmix:cmContentTreeDisplayable', 'jmix:visibleInContentTree', 'jnt:contentFolder'],
            rootLabel: 'jcontent:label.contentManager.browseFolders',
            key: 'browse-tree-content'
        },
        pages: {
            rootPath: '',
            selectableTypes: ['jnt:page', 'jnt:virtualsite'],
            type: 'pages',
            openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'],
            rootLabel: 'jcontent:label.contentManager.browsePages',
            key: 'browse-tree-pages'
        },
        files: {
            rootPath: '/files',
            selectableTypes: ['jnt:folder'],
            type: 'files',
            openableTypes: ['jnt:folder'],
            rootLabel: 'jcontent:label.contentManager.browseFiles',
            key: 'browse-tree-files'
        }
    },
    localStorageKeys: {
        filesSelectorMode: 'jcontent_files_selector_mode',
        filesSelectorGridMode: 'jcontent_files_selector_grid_mode'
    },
    gridMode: {
        THUMBNAIL: 'thumbnail',
        DETAILED_VIEW: 'detailed-view',
        DETAILED: 'detailed',
        LIST: 'list-view'
    }
};

export default JContentConstants;
