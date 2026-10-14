import gql from 'graphql-tag';

export const FieldValuesByLanguageQuery = gql`
    query fieldValuesByLanguage($uuidOrPath: String!, $fieldName: String!, $multiple: Boolean!, $languages: [String]!) {
        forms {
            fieldValuesByLanguage(uuidOrPath: $uuidOrPath, fieldName: $fieldName, multiple: $multiple, languages: $languages) {
                language
                readOnly
                values {
                    string
                    type
                }
            }
        }
    }
`;
