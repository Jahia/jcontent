import gql from 'graphql-tag';

// Fetches only the form section definitions for a given node — no live node data.
// Used by useVersionSnapshotFormDefinition: form structure comes from the live node type,
// property values come from the CompositeContentSnapshot.
// TODO reuse existing GQL from jContent
export const SnapshotFormSectionsQuery = gql`
    query snapshotFormSections($uilang: String!, $language: String!, $uuid: String!, $snapshotMixins: [String]!) {
        forms {
            editFormForSnapshot(uiLocale: $uilang, locale: $language, uuidOrPath: $uuid, snapshotMixins: $snapshotMixins) {
                sections {
                    name
                    displayName
                    description
                    visible
                    expanded
                    fieldSets {
                        name
                        displayName
                        description
                        visible
                        dynamic
                        activated
                        hasEnableSwitch
                        readOnly
                        fields {
                            name
                            displayName
                            description
                            errorMessage
                            visible
                            mandatory
                            i18n
                            multiple
                            readOnly
                            requiredType
                            selectorType
                            declaringNodeType
                            selectorOptions {
                                name
                                value
                                values
                            }
                            valueConstraints {
                                value {
                                    type
                                    string
                                }
                                displayValue
                                displayValueKey
                                properties {
                                    name
                                    value
                                }
                            }
                            defaultValues {
                                string
                            }
                        }
                    }
                }
            }
        }
    }
`;
