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

// Counts, per field, how many languages already hold a value in the repository - used to annotate
// the modal's field switcher. Only property *names* are selected on purpose: presence in the result
// already answers the question, while pulling values would drag every rich text body of every
// language over the wire. Languages are aliased positionally because a language code is not always
// a valid GraphQL alias.
export const buildFieldsFilledLanguagesQuery = languages => gql`
    query fieldsFilledLanguages($uuid: String!, $names: [String!]!) {
        jcr {
            nodeById(uuid: $uuid) {
                uuid
                ${languages.map((language, index) => `l${index}: properties(names: $names, language: "${language}") { name }`).join('\n                ')}
            }
        }
    }
`;
