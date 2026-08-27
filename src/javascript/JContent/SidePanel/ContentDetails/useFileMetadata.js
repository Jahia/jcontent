import {useMemo} from 'react';
import {gql, useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useSidePanelContext} from '../SidePanelContext';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

// EXIF and XMP/IPTC metadata read out of an uploaded binary, for read-only display in the details
// tab. Deliberately read straight from the JCR rather than from `forms.editForm`: the form service
// prunes anything hidden out of its payload, so a form definition that hides these field sets from
// Content Editor would otherwise empty this panel too.
const NODE_TYPES = Constants.fileMetadataFieldSets;

// Section titles come from our own bundle rather than from the node type label, so that they read
// the same here as they do on the Content Editor field sets. Core labels jmix:exif "Picture file
// (EXIF)", which names a kind of file rather than a group of metadata. Any field set added later
// and not listed here falls back to its node type label.
const SECTION_TITLE_KEYS = {
    'jmix:exif': 'jcontent:label.contentEditor.sidePanel.exifMetadata',
    'jmix:iptc': 'jcontent:label.contentEditor.sidePanel.iptcMetadata'
};

const GET_FILE_METADATA = gql`
    query getFileMetadata($uuid: String!, $language: String!, $uilang: String!, $nodeTypes: [String]!) {
        jcr {
            nodeById(uuid: $uuid) {
                uuid
                workspace
                path
                properties(language: $language) {
                    name
                    value
                    values
                }
            }
            nodeTypesByNames(names: $nodeTypes) {
                name
                displayName(language: $uilang)
                properties {
                    name
                    displayName(language: $uilang)
                    multiple
                    hidden
                }
            }
        }
    }
`;

/**
 * Builds one group per node type, in the order given, listing only the properties that carry a
 * value. Property order and labels come from the node type definition, so the panel follows the CND
 * declaration order and the same resource bundles Content Editor resolves its labels from. A group
 * with no filled property is dropped, which is also what excludes a node lacking the mixin
 * altogether.
 */
export const adaptFileMetadata = (data, nodeTypeNames = NODE_TYPES) => {
    const properties = data?.jcr?.nodeById?.properties ?? [];
    const valuesByName = new Map(properties.map(property => [property.name, property]));
    const definitions = data?.jcr?.nodeTypesByNames ?? [];

    return nodeTypeNames
        .map(name => definitions.find(definition => definition?.name === name))
        .filter(Boolean)
        .map(nodeType => ({
            name: nodeType.name,
            displayName: nodeType.displayName || nodeType.name,
            entries: (nodeType.properties ?? [])
                .filter(definition => !definition.hidden)
                .map(definition => {
                    const property = valuesByName.get(definition.name);
                    return {
                        label: definition.displayName || definition.name,
                        value: definition.multiple ?
                            (property?.values ?? []).filter(Boolean).join('; ') :
                            property?.value
                    };
                })
                .filter(entry => entry.value)
        }))
        .filter(group => group.entries.length > 0);
};

/**
 * Metadata groups for one node, given its uuid. Kept separate from the side panel so the same
 * reading can be shown wherever a file is referenced rather than only where it is the node being
 * looked at — notably under an image picker in Content Editor.
 *
 * @param {object} params the node to read
 * @param {string} params.uuid uuid of the file to read the metadata of
 * @param {string} params.lang language the values are read in
 * @param {boolean} [params.skip] skip the lookup, for a node known not to be a file
 * @returns {object[]} one group per node type carrying at least one filled property
 */
export const useNodeFileMetadata = ({uuid, lang, skip = false}) => {
    const {t} = useTranslation('jcontent');
    const uilang = useSelector(state => state.uilang);

    const {data} = useQuery(GET_FILE_METADATA, {
        variables: {uuid, language: lang, uilang, nodeTypes: NODE_TYPES},
        skip: skip || !uuid || !lang || !uilang
    });

    return useMemo(() => adaptFileMetadata(data).map(group => ({
        ...group,
        displayName: SECTION_TITLE_KEYS[group.name] ? t(SECTION_TITLE_KEYS[group.name]) : group.displayName
    })), [data, t]);
};

export const useFileMetadata = () => {
    const {nodeData, lang} = useSidePanelContext();

    // These mixins only ever land on a file, so there is nothing to look up for other content
    return useNodeFileMetadata({uuid: nodeData?.uuid, lang, skip: !nodeData?.isFile});
};
