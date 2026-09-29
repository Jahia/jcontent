import {createNode} from './createNode';

jest.mock('./createNode.gql-mutation', () => {
    return {
        CreateNode: 'CreateNode'
    };
});

describe('createNode', () => {
    const consoleErrorOriginal = console.error;

    beforeEach(() => {
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = consoleErrorOriginal;
    });

    let params;
    beforeEach(() => {
        params = {
            client: {
                mutate: jest.fn(() => Promise.resolve({
                    data: {
                        jcr: {
                            modifiedNodes: [{
                                path: '/this/is/sparta'
                            }]
                        }
                    }
                })),
                cache: {
                    flushNodeEntryById: jest.fn()
                }
            },
            notificationContext: {notify: jest.fn()},
            actions: {setSubmitting: jest.fn()},
            t: jest.fn(),
            createCallback: jest.fn(),
            data: {
                primaryNodeType: 'jnt:text',
                nodeData: {},
                sections: [],
                values: {
                    'ce:systemName': 'dummmySystemName'
                },
                i18nContext: {}
            }
        };
    });

    it('should call CreateNode mutation', async () => {
        await createNode(params);

        expect(params.client.mutate).toHaveBeenCalled();
        expect(params.client.mutate.mock.calls[0][0].mutation).toBe('CreateNode');
    });

    it('should call createCallback function', async () => {
        await createNode(params);

        expect(params.createCallback).toHaveBeenCalled();
        expect(params.client.mutate.mock.calls[0][0].mutation).toBe('CreateNode');
    });

    it('should use the system name form value when the system name field is not in the form', async () => {
        params.data.nodeData = {newName: 'teachingthemes'};
        params.data.values = {'nt:base_ce:systemName': 'teachingThemes'};

        await createNode(params);

        expect(params.client.mutate.mock.calls[0][0].variables.name).toBe('teachingThemes');
    });

    it('should fall back to the available node name when the form holds no system name', async () => {
        params.data.nodeData = {newName: 'text-1'};
        params.data.values = {};

        await createNode(params);

        expect(params.client.mutate.mock.calls[0][0].variables.name).toBe('text-1');
    });
});
