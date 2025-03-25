const JContentConstants = {
    namingInvalidCharactersRegexp: /[\\/:*?"<>|%]/g,
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
    statusView: {
        NO_STATUS: 'noStatus',
        PUBLISHED: 'published',
        VISIBILITY: 'visibility',
        PERMISSIONS: 'permissions'
    },
    mode: {
        CONTENT_FOLDERS: 'content-folders',
        PAGES: 'pages',
        MEDIA: 'media',
        FORMS: 'forms',
        APPS: 'apps',
        SEARCH: 'search',
        SQL2SEARCH: 'sql2Search',
        LIST: 'list',
        GRID: 'grid',
        UPLOAD: 'upload',
        IMPORT: 'import'
    },
    localStorageKeys: {
        viewType: 'jcontent_view_type',
        viewMode: 'jcontent_view_mode',
        filesSelectorMode: 'jcontent_files_selector_mode'
    },
    accordionPermissions: {
        pagesAccordionAccess: 'pagesAccordionAccess',
        contentFolderAccordionAccess: 'contentFolderAccordionAccess',
        mediaAccordionAccess: 'mediaAccordionAccess',
        additionalAccordionAccess: 'additionalAccordionAccess',
        formAccordionAccess: 'formAccordionAccess'
    },
    tableView: {
        viewMode: {
            FLAT: 'flatList',
            STRUCTURED: 'structuredView',
            PAGE_BUILDER: 'pageBuilder'
        },
        viewType: {
            CONTENT: 'content',
            PAGES: 'pages'
        }
    },
    tableRowHeight: 48
};

export default JContentConstants;
