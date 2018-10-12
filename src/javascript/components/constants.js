const Constants = {
    contentType: "jmix:editorialContent",
    maxCreateContentOfTypeDirectItems: 5,
    availablePublicationStatuses: {
        "PUBLISHED": "PUBLISHED",
        "MODIFIED": "MODIFIED",
        "NOT_PUBLISHED": "NOT_PUBLISHED",
        "MARKED_FOR_DELETION": "MARKED_FOR_DELETION"
    },
    browsingPathByType: {
        "contents": "browse",
        "pages": "browse",
        "files": "browse-files"
    },
    locationModeIndex: 2,
    mode: {
        BROWSE: "browse",
        FILES: "browse-files",
        SEARCH: "search",
        SQL2SEARCH: "sql2Search"
    },
    contentTreeConfigs: {
        contents: {
            rootPath: "/contents",
            selectableTypes: ['jmix:list'],
            type: "contents",
            openableTypes: ['jmix:list', 'jnt:contentFolder'],
            rootLabel: "label.contentManager.browseFolders",
            key: "browse-tree-content"
        },
        pages: {
            rootPath: "",
            selectableTypes: ['jnt:page', 'jnt:virtualsite'],
            type: "pages",
            openableTypes: ['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText'],
            rootLabel: "label.contentManager.browsePages",
            key: "browse-tree-pages"
        },
        files: {
            rootPath: "/files",
            selectableTypes: ['jnt:folder'],
            type: "files",
            openableTypes: ['jnt:folder'],
            rootLabel: "label.contentManager.browseFiles",
            key: "browse-tree-files"
        }
    }
};

export default Constants;