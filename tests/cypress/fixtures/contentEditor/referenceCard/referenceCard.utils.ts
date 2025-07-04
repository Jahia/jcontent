import gql from 'graphql-tag';

export function createSubpages(siteKey) {
    return cy.apollo({
        mutation: gql`
            mutation createRefCardSubpages {
                jcr {
                    mutateNode(pathOrId: "/sites/${siteKey}/home") {
                        addChildrenBatch(nodes: [
                            {
                                name: "test-page1"
                                primaryNodeType: "jnt:page"
                                properties: [
                                    { name: "jcr:title", language: "en", value: "Page test 1" },
                                    { name: "j:templateName", value: "home" }
                                ]
                            },
                            {
                                name: "test-page2"
                                primaryNodeType: "jnt:page"
                                properties: [
                                    { name: "jcr:title", language: "en", value: "Page test 2" },
                                    { name: "j:templateName", value: "home" }
                                ]
                            },
                            {
                                name: "test-page3"
                                primaryNodeType: "jnt:page"
                                properties: [
                                    { name: "jcr:title", language: "en", value: "Page test 3" },
                                    { name: "j:templateName", value: "home" }
                                ]
                            },
                            {
                                name: "test-page4"
                                primaryNodeType: "jnt:page"
                                properties: [
                                    { name: "jcr:title", language: "en", value: "Page test 4" },
                                    { name: "j:templateName", value: "home" }
                                ]
                            }
                        ]) { uuid }
                    }
                }
            }
        `
    });
}

/* Needs qa-module to be enabled on the site */
export function createPickerReferences(siteKey: string, uuids: string[]) {
    return cy.apollo({
        variables: {uuids},
        mutation: gql`
            mutation createRefCardPickerReferences($uuids: [String!]!) {
                jcr {
                    addNode(
                        parentPathOrId: "/sites/${siteKey}/contents",
                        name: "pickerRefCard",
                        primaryNodeType: "cent:testPickerRefCard",
                        properties: [{name: "pagepicker", type: WEAKREFERENCE, values: $uuids}]
                    ) { uuid }
                }
            }
        `
    });
}
