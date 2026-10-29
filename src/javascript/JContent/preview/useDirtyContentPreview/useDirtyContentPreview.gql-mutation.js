import gql from 'graphql-tag';

/**
 * Renders a node as it WOULD look with the editor's unsaved values applied.
 *
 * `jcr(save: false)` applies the mutations to the request's JCR session and never commits it, so
 * the render that follows in the same request reads the dirty session. Nothing reaches the
 * repository: no observation event, no cache flush, no indexing.
 *
 * The second `mutateNode` mutates nothing — it is the only way to obtain a JCRNode *of the same
 * session* for a node other than the edited one, which is what the in-context strategy needs:
 * `renderPath` is usually the hosting PAGE, with the edited node somewhere inside it.
 *
 * The edited node's mutation is declared FIRST on purpose: graphql-java guarantees serial
 * execution only at the root mutation field, so the sibling order under `jcr` is what makes the
 * render observe the dirty session rather than racing it.
 */
export const DIRTY_CONTENT_PREVIEW_MUTATION = gql`
    mutation dirtyContentPreview(
        $uuid: String!,
        $propertiesToSave: [InputJCRProperty],
        $propertiesToDelete: [InputJCRDeletedProperty],
        $mixinsToAdd: [String]!,
        $mixinsToDelete: [String]!,
        $renderPath: String!,
        $templateType: String!,
        $view: String,
        $contextConfiguration: String!,
        $language: String!,
        $requestAttributes: [InputRenderRequestAttributeInput],
        $mainResourcePath: String
    ) {
        jcr(save: false, workspace: EDIT) {
            mutateNode(pathOrId: $uuid) {
                removeMixins(mixins: $mixinsToDelete)
                addMixins(mixins: $mixinsToAdd)
                setPropertiesBatch(properties: $propertiesToSave) {
                    path
                }
                deletePropertiesBatch(properties: $propertiesToDelete)
            }
            render: mutateNode(pathOrId: $renderPath) {
                node {
                    id: uuid
                    path
                    renderedContent(
                        templateType: $templateType,
                        view: $view,
                        contextConfiguration: $contextConfiguration,
                        language: $language,
                        requestAttributes: $requestAttributes,
                        mainResourcePath: $mainResourcePath
                    ) {
                        output
                        staticAssets(type: "css") {
                            key
                        }
                    }
                }
            }
        }
    }
`;
