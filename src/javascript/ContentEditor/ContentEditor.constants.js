import JContentConstants from '~/JContent/JContent.constants';

export const Constants = /** @type {const} */ ({
    editPanel: {
        // DEPRECATED: use JContentConstants.availablePublicationStatuses instead
        publicationStatus: JContentConstants.availablePublicationStatuses,
        editTab: 'EDIT',
        translateTab: 'TRANSLATE'
    },
    field: {
        selectorType: {
            CHOICELIST: 'Choicelist'
        }
    },
    supportedLocales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
    routes: {
        baseEditRoute: 'edit',
        baseCreateRoute: 'create'
    },
    operators: {
        update: 'update',
        create: 'create'
    },
    notSupportedEngineTabs: ['content', 'categories'],
    systemName: {
        name: 'nt:base_ce:systemName',
        propertyName: 'ce:systemName',
        READONLY_FOR_NODE_TYPES: [
            'jnt:group',
            'jnt:groupsFolder',
            'jnt:mounts',
            'jnt:remotePublications',
            'jnt:modules',
            'jnt:module',
            'jnt:moduleVersion',
            'jnt:templateSets',
            'jnt:user',
            'jnt:usersFolder',
            'jnt:virtualsite',
            'jnt:virtualsitesFolder'
        ]
    },
    wip: {
        fieldName: 'WIP::Info',
        status: {
            DISABLED: 'DISABLED',
            ALL_CONTENT: 'ALL_CONTENT',
            LANGUAGES: 'LANGUAGES'
        },
        notAvailableFor: ['jnt:virtualsite']
    },
    ordering: {
        childrenKey: 'Children::Order',
        automaticOrdering: {
            section: 'listOrdering',
            mixin: 'jmix:orderedList'
        }
    },
    permissions: {
        canSeeAdvancedOptionsTab: 'canSeeAdvancedOptionsTab',
        setContentLimitsOnAreas: 'setContentLimitsOnAreas'
    },
    childrenFilterTypes: ['jnt:content', 'jmix:manuallyOrderable', 'jnt:page', 'jmix:navMenuItem'],
    // Field sets whose properties are read out of an uploaded binary rather than authored (EXIF,
    // XMP/IPTC). Most of their fields are empty on any given image, so both the edit form and the
    // side panel's details tab list only the filled ones, and keep each provenance in its own group.
    fileMetadataFieldSets: ['jmix:exif', 'jmix:iptc'],
    color: {
        hexColorRegexp: /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/i,
        errorCode: 'invalidColor',
        selectorType: 'Color'
    },
    keyCodes: {
        s: 83,
        esc: 27
    }
});
