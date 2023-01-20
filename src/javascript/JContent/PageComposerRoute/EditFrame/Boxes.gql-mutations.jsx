import gql from 'graphql-tag';

export const updateProperty = gql`mutation m($path:String!, $property: String!, $value:String!, $language:String!) {
    jcr {
        mutateNode(pathOrId:$path) {
            mutateProperty(name:$property) {
                setValue(value:$value, language:$language)
            }
        }
    }
}`;
