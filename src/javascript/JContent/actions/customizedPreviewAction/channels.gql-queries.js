import gql from 'graphql-tag';

export const GET_CHANNEL_DATA = gql`
    query {
        jcontent {
            channels {
                value: name
                label: displayName
                isVisible
                variants {
                    value: name
                    label: displayName
                    imageSize {
                        width
                        height
                    }
                }
            }
        }
    }
`;
