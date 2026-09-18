import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/data-helper';

export const FocalPointQuery = gql`
    query focalPoint($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
                path
                displayName
                lastModified: property(name: "jcr:lastModified") {
                    value
                }
                focalX: property(name: "j:focalX") {
                    value
                }
                focalY: property(name: "j:focalY") {
                    value
                }
                # Existence probe: the dialog shows the 800px rendition when there is one, so a large
                # original is not downloaded just to place a point on it
                hasThumbnail3: thumbnailUrl(name: "thumbnail3", checkIfExists: true)
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

// "extends" on jmix:focalPoint only makes the mixin available on images, it does not put it on the
// node - NodeTypeRegistry keeps those extensions purely as a list of mixins that MAY be added. So
// the mixin has to be added here, or setProperty throws "Couldn't find definition for property".
// addMixins is a no-op when the node already has it.
export const SetFocalPointMutation = gql`
    mutation setFocalPoint($path: String!, $focalX: String!, $focalY: String!) {
        jcr {
            mutateNode(pathOrId: $path) {
                addMixins(mixins: ["jmix:focalPoint"])
                focalX: mutateProperty(name: "j:focalX") {
                    setValue(value: $focalX, type: DOUBLE)
                }
                focalY: mutateProperty(name: "j:focalY") {
                    setValue(value: $focalY, type: DOUBLE)
                }
            }
        }
    }
`;

export const ClearFocalPointMutation = gql`
    mutation clearFocalPoint($path: String!) {
        jcr {
            mutateNode(pathOrId: $path) {
                focalX: mutateProperty(name: "j:focalX") {
                    delete
                }
                focalY: mutateProperty(name: "j:focalY") {
                    delete
                }
                removeMixins(mixins: ["jmix:focalPoint"])
            }
        }
    }
`;
