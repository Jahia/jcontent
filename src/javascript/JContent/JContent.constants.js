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
    mode: {
        CONTENT_FOLDERS: 'content-folders',
        PAGES: 'pages',
        MEDIA: 'media',
        SEARCH: 'search',
        SQL2SEARCH: 'sql2Search',
        LIST: 'list',
        GRID: 'grid',
        UPLOAD: 'upload',
        IMPORT: 'import',
        APPS: 'apps'
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
