import gql from 'graphql-tag';

export const addRestrictedPage = (siteKey, page) => gql`
    mutation {
        jcr {
            mutateNode(pathOrId: "/sites/${siteKey}/home") {
                addChildrenBatch(nodes: [
                    {
                        name: "${page}",
                        primaryNodeType: "jnt:page",
                        properties: [
                            { name: "jcr:title", language: "en", value: "${page}" }
                            { name: "j:templateName", value: "contentType" }
                        ]
                        children: [
                            {name: "any-area", primaryNodeType: "jnt:contentList", children: [
                                {
                                    name: "allowedText",
                                    primaryNodeType: "pbnt:contentRestriction",
                                    properties: [{ name: "text", language: "en", value: "allowed text ok" }]
                                }
                                {
                                    name: "notAllowedText",
                                    primaryNodeType: "jnt:text",
                                    properties: [{ name: "text", language: "en", value: "not allowed text" }]
                                }
                            ]},
                            {name: "restricted-area", primaryNodeType: "jnt:contentList"},
                        ]
                    }
                ]) {
                    uuid
                }
            }
        }
    }`;
