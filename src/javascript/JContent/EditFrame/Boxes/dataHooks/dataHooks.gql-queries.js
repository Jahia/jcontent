import gql from 'graphql-tag';

export const NodeTypeInfos = gql`
    query getNodeTypeInfos($types:[InputNodeTypeInfosParams]!, $uilang:String!) {
        forms {
            nodeTypeInfos(
                types: $types
                uiLocale: $uilang
            ) {
                nodeTypeInfos {
                    iconURL
                    label
                    name
                }
                path
            }
        } 
    }
`;
