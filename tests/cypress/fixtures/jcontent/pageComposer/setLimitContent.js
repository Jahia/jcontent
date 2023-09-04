import gql from 'graphql-tag';

export const addPageGql = (siteKey, page) => gql`mutation {
    jcr {
        addNode(
            parentPathOrId:"/sites/${siteKey}/home", 
            name: "${page}", 
            primaryNodeType: "jnt:page", 
            properties: [
                { name: "jcr:title", language: "en", value: "${page}" }
                { name: "j:templateName", value: "simple" }
            ]) {
            uuid
        } 
    }
}`;

export const addContentGql = (siteKey, page) => gql`
    mutation addContent {
        jcr {
            mutateNode(pathOrId:"/sites/${siteKey}/home/${page}/my-area") {
                addChildrenBatch(nodes: [
                    {name:"abc1", primaryNodeType:"jnt:text",  properties: [{ name: "text", value: "abc1", language: "en"}]},
                    {name:"abc2", primaryNodeType:"jnt:text",  properties: [{ name: "text", value: "abc2", language: "en"}]},
                    {name:"abc3", primaryNodeType:"jnt:text",  properties: [{ name: "text", value: "abc3", language: "en"}]},
                ]) {uuid}
            }
        }
    }`;
