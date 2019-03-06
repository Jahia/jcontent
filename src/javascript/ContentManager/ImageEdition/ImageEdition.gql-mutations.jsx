import gql from 'graphql-tag';

const getImageMutation = transforms => gql`
    mutation ImageMutation($path:String!) {
        jcr {
            mutateNode(pathOrId: $path) {
                transformImage {
                    ${transforms.map((t, idx) => 'op' + idx + ':' + t.op + '(' + Object.keys(t.args).map(k => k + ':' + JSON.stringify(t.args[k])) + ')')}
                    node {
                        uuid
                    }
                }
            }
        }
    }
`;

export {getImageMutation};
