import gql from 'graphql-tag';

// The server answers without an error only when both graphql-core and the core of Jahia show unsaved values. A server
// whose jcr root lacks the argument refuses the query too.
export const UnsavedValuesSupportQuery = gql`
    query unsavedValuesSupport($node: String!) {
        jcr(workspace: EDIT, unsavedValues: {node: $node}) {
            workspace
        }
    }
`;
