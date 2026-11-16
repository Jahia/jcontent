import gql from 'graphql-tag';

export const FilterFieldsQuery = gql`
    query filterFields($type: String!, $language: String!) {
        jcr {
            nodeTypeByName(name: $type) {
                name
                properties {
                    name
                    displayName(language: $language)
                    requiredType
                    multiple
                    hidden
                    protected
                    constraints
                }
            }
        }
    }
`;

export const FilterFormFieldsQuery = gql`
    query filterFormFields($type: String!, $language: String!, $path: String!) {
        forms {
            createForm(primaryNodeType: $type, uiLocale: $language, locale: $language, uuidOrPath: $path) {
                sections {
                    fieldSets {
                        fields {
                            name
                            selectorType
                            valueConstraints {
                                value {
                                    string
                                }
                                displayValue
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const FilterContentTypesQuery = gql`
    query filterContentTypes($siteKey: String!, $language: String!) {
        jcr {
            nodeTypes(filter: {includeMixins: false, siteKey: $siteKey, includeTypes: ["jnt:content"], excludeTypes: ["jmix:studioOnly", "jmix:hiddenType"]}) {
                nodes {
                    name
                    displayName(language: $language)
                }
            }
        }
    }
`;
