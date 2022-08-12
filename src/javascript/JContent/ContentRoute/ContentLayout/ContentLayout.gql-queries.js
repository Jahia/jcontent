import gql from 'graphql-tag';

const mixinTypes = gql`
    query mixinTypes($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                mixinTypes {
                    name
                }
            }
        }
    }
`;

export {
    mixinTypes
};
