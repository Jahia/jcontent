import {useMemo} from 'react';
import {gql, useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import {useSidePanelContext} from '../SidePanelContext';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

// EXIF and XMP/IPTC metadata read out of an uploaded binary, for read-only display in the details
// tab. Deliberately read straight from the JCR rather than from `forms.editForm`: the form service
// prunes anything hidden out of its payload, so a form definition that hides these field sets from
// Content Editor would otherwise empty this panel too.
const NODE_TYPES = Constants.fileMetadataFieldSets;

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

export const useFileMetadata = () => {
    const {nodeData, lang} = useSidePanelContext();
    const uilang = useSelector(state => state.uilang);
    const uuid = nodeData?.uuid;

    const {data} = useQuery(GET_FILE_METADATA, {
        variables: {uuid, language: lang, uilang, nodeTypes: NODE_TYPES},
        // These mixins only ever land on a file, so there is nothing to look up for other content
        skip: !uuid || !lang || !uilang || !nodeData?.isFile
    });

    return useMemo(() => adaptFileMetadata(data), [data]);
};
