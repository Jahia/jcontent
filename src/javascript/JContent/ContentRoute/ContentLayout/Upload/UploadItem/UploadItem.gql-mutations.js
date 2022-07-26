import gql from 'graphql-tag';

// export const ensureDir = path => {
//     const folders = path.substring(1).split('/').reduce((acc,f) =>
//         acc.length === 0 ? [{parent: '', name: f, idx:0}] : [...acc, {parent: acc[acc.length-1].parent + '/' + acc[acc.length-1].name, name: f, idx:acc.length}]
//     , []);
//
//     const c = folders.map(f => `
//         f${f.idx}: jcr {
//             mutateNodesByQuery(query: "/jcr:root${f.parent}[not(${f.name}/@jcr:primaryType!='')]", queryLanguage: XPATH) {
//                 addChild(name:"${f.name}", primaryNodeType:"jnt:folder") {
//                     uuid
//                 }
//             }
//         }
//     `).join('');
//
//     return gql`mutation ensureDir {
//         ${c}
//     }`;
// }

export const uploadFile = gql`mutation uploadFile($nameInJCR: String!, $path: String!, $mimeType: String!, $fileHandle: String!) {
    jcr {
        addNode(name: $nameInJCR, parentPathOrId: $path, primaryNodeType: "jnt:file") {
            addChild(name: "jcr:content", primaryNodeType: "jnt:resource") {
                content: mutateProperty(name: "jcr:data") {
                    setValue(type: BINARY, value: $fileHandle)
                }
                contentType: mutateProperty(name: "jcr:mimeType") {
                    setValue(value: $mimeType)
                }
            }
            uuid
        }
    }
}`;

export const updateFileContent = gql`mutation updateFileContent($path: String!, $mimeType: String!, $fileHandle: String!) {
    jcr {
        mutateNode(pathOrId: $path) {
            mutateChildren(names: ["jcr:content"]) {
                content: mutateProperty(name: "jcr:data") {
                    setValue(type: BINARY, value: $fileHandle)
                }
                contentType: mutateProperty(name: "jcr:mimeType") {
                    setValue(value: $mimeType)
                }
            }
            uuid
        }
    }
}`;

export const importContent = gql`mutation importContent($path: String!, $fileHandle: String!, $rootBehaviour: Int!) {
    jcr {
        importContent(parentPathOrId: $path, file: $fileHandle, rootBehaviour: $rootBehaviour)
    }
}`;
