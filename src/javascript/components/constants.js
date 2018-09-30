const constants = {
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
    }
};

export default constants;