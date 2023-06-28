export class GraphqlUtils {
    // Graphql mutation to set property on a node
    public static setProperties = (pathOrId: string, property: string, values: Array<string>, language: string) => {
        cy.apollo({
            variables: {
                pathOrId: pathOrId,
                property: property,
                values: values,
                language: language
            },
            mutationFile: 'jcontent/jcrSetProperties.graphql'
        }).then(result => {
            expect(result?.data?.jcr?.mutateNode?.mutateProperty?.setValues).to.eq(true);
        });
    };

    // Graphql mutation to add a node
    public static addNode = (parentPathOrId: string, primaryNodeType: string, name: string) => {
        cy.apollo({
            variables: {
                parentPathOrId: parentPathOrId,
                primaryNodeType: primaryNodeType,
                name: name
            },
            mutationFile: 'jcontent/jcrAddNode.graphql'
        }).then(result => {
            expect(result?.data?.jcr?.addNode?.node?.name).to.eq(name);
        });
    };

    // Graphql mutation to remove a node
    public static deleteNode = (pathOrId: string) => {
        cy.apollo({
            variables: {
                pathOrId: pathOrId
            },
            mutationFile: 'jcontent/jcrDeleteNode.graphql',
            errorPolicy: 'ignore'
        }).then(result => {
            expect(result?.data?.jcr?.deleteNode).to.satisfy((value) => value === null || value === true);
        });
    };

    // Graphql mutation to remove a Node property
    public static deleteProperty = (pathOrId: string, property: string, language: string) => {
        cy.apollo({
            variables: {
                pathOrId: pathOrId,
                property: property,
                language: language
            },
            mutationFile: 'jcontent/jcrDeleteProperty.graphql'
        }).then(result => {
            expect(result?.data?.jcr?.mutateNode?.mutateProperty?.delete).to.eq(true);
        });
    };

    public static getNodeId = (path: string, as?: string) => {
        const asValue = typeof as === 'undefined' ? 'ret' : as;

        cy.apollo({
            variables: {
                path: path
            },
            queryFile: 'jcontent/jcrGetNode.graphql'
        }).its('data.jcr.nodeByPath.uuid').as(asValue);
        if (typeof as === 'undefined') {
            cy.get('@ret').then(uuid => {
                return `${uuid}`;
            });
        }
    };

    public static setProperty = (pathOrId: string, property: string, value: string, language: string) => {
        cy.apollo({
            variables: {
                pathOrId: pathOrId,
                property: property,
                value: value,
                language: language
            },
            mutationFile: 'jcontent/jcrSetProperty.graphql'
        }).then(result => {
            expect(result?.data?.jcr?.mutateNode?.mutateProperty?.setValue).to.eq(true);
        });
    };

    public static addMixins = (pathOrId: string, mixins: Array<string>, expectedMixins?: Array<string>) => {
        cy.apollo({
            variables: {
                pathOrId: pathOrId,
                mixins: mixins
            },
            mutationFile: 'jcontent/jcrAddMixins.graphql'
        }).then(result => {
            const mixinsRes = result?.data?.jcr?.mutateNode?.addMixins;
            const expected = typeof expectedMixins === 'undefined' ? mixins : expectedMixins;
            expect(JSON.stringify(mixinsRes)).to.eq(JSON.stringify(expected));
        });
    };

    public static removeMixins = (pathOrId: string, mixins: Array<string>, expectedMixins?: Array<string>) => {
        cy.apollo({
            variables: {
                pathOrId: pathOrId,
                mixins: mixins
            },
            mutationFile: 'jcontent/jcrRemoveMixins.graphql'
        }).then(result => {
            const mixinsRes = result?.data?.jcr?.mutateNode?.removeMixins;
            const expected = typeof expectedMixins === 'undefined' ? [] : expectedMixins;
            expect(JSON.stringify(mixinsRes)).to.eq(JSON.stringify(expected));
        });
    };
}
