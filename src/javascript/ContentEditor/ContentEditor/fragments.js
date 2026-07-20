import gql from 'graphql-tag';

/** Fragment on `GqlEditorForm` to populate Content Editor forms. */
export const ContentEditorFragment = gql`
    fragment ContentEditorFragment on GqlEditorForm {
        hasPreview
        showAdvancedMode
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
`;
