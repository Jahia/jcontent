import gql from 'graphql-tag';

export const GET_USER_ICON = gql`
    query getUserIcon {
        jcr {
            nodeTypeByName(name: "jnt:user") {
                icon
                name
            }
            workspace
        }
    }
`;
