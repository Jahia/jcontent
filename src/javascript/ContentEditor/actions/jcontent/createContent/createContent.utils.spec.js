import {
    childrenLimitReachedOrExceeded,
    flattenNodeTypes,
    getCreatableNodetypesTree,
    getCreateChildrenButtonLimit,
    transformNodeTypesToActions
} from './createContent.utils';

jest.mock('@jahia/moonstone');
global.contextJsParameters = {config: {jcontent: {'createChildrenDirectButtons.limit': 3}}};
describe('getCreateChildrenButtonLimit', () => {
    const original = global.contextJsParameters;

    afterEach(() => {
        global.contextJsParameters = original;
    });

    it('should read the configured limit', () => {
        global.contextJsParameters = {config: {jcontent: {'createChildrenDirectButtons.limit': '7'}}};
        expect(getCreateChildrenButtonLimit()).toBe(7);
    });

    it('should fall back to the shipped default when the module configuration is absent', () => {
        // Config.jcontent is undefined whenever configs/jcontent.js has not delivered; reading
        // through it used to throw and take the whole main panel down.
        global.contextJsParameters = {config: {}};
        expect(getCreateChildrenButtonLimit()).toBe(5);
    });

    it('should fall back when the configured value is not a number', () => {
        global.contextJsParameters = {config: {jcontent: {'createChildrenDirectButtons.limit': 'nonsense'}}};
        expect(getCreateChildrenButtonLimit()).toBe(5);
    });
});

describe('CreateNewContent utils', () => {
    describe('getActions', () => {
        let client;
        let queryResponse;

        const getActions = async (client, showOnNodeTypes) => {
            return transformNodeTypesToActions(flattenNodeTypes(await getCreatableNodetypesTree({client, nodeTypes: 'jnt:page', includeSubTypes: false, path: '/dummy/path', uilang: 'en', excludedNodeTypes: ['jmix:studioOnly', 'jmix:hiddenType'], showOnNodeTypes})));
        };

        beforeEach(() => {
            client = {
                query: jest.fn(() => Promise.resolve(queryResponse))
            };

            queryResponse = {
                data: {
                    forms: {
                        contentTypesAsTree: [
                            {
                                name: 'parent',
                                children: [
                                    {name: 'toto'}
                                ]
                            },
                            {
                                name: 'tata',
                                children: []
                            }
                        ]
                    },
                    jcr: {
                        nodeByPath: {
                            isNodeType: true
                        }
                    }
                }
            };
        });

        it('should make a query', async () => {
            await getActions(client);

            expect(client.query).toHaveBeenCalled();
        });

        it('should return empty array when nodetype is not allowed', async () => {
            queryResponse.data.jcr.nodeByPath.isNodeType = false;
            expect(await getActions(client, ['jnt:content'])).toEqual([]);
        });

        it('should return empty array when no contentTypesAsTree is returned', async () => {
            queryResponse.data.forms.contentTypesAsTree = [];
            expect(await getActions(client)).toEqual([]);
        });

        it('should return null when there is more than 3 nodeTypes', async () => {
            queryResponse.data.forms.contentTypesAsTree.push({
                name: 'yolo'
            });
            queryResponse.data.forms.contentTypesAsTree.push({
                name: 'yola'
            });
            expect(await getActions(client)).toEqual(undefined);
        });

        it('should return actions', async () => {
            queryResponse.data.forms.contentTypesAsTree.push({
                name: 'tete'
            });
            const actions = await getActions(client);
            expect(actions[0].key).toEqual('toto');
            expect(actions[1].key).toEqual('tata');
            expect(actions[2].key).toEqual('tete');
            expect(actions.length).toBe(3);
        });

        it('should return actions without jnt:resource', async () => {
            queryResponse.data.forms.contentTypesAsTree.push({
                name: 'jnt:resource'
            });

            const actions = await getActions(client);
            expect(actions[0].key).toEqual('toto');
            expect(actions[1].key).toEqual('tata');
            expect(actions.length).toBe(2);
        });
    });

    let node;
    beforeEach(() => {
        node = {
            'jmix:listSizeLimit': true,
            properties: [{name: 'limit', value: 5}],
            'subNodesCount_nt:base': 6
        };
    });

    it('should return false when null object', async () => {
        expect(childrenLimitReachedOrExceeded(null)).toBe(false);
    });

    it('should return true if child limit is exceeded', async () => {
        expect(childrenLimitReachedOrExceeded(node)).toBe(true);
        node['subNodesCount_nt:base'] = 4;
        expect(childrenLimitReachedOrExceeded(node)).toBe(false);
    });

    it('should return false if jmix:listSizeLimit is false', async () => {
        expect(childrenLimitReachedOrExceeded(node)).toBe(true);
        node['jmix:listSizeLimit'] = false;
        expect(childrenLimitReachedOrExceeded(node)).toBe(false);
    });
});
