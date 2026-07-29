import {useEngineTabAvailability} from './useEngineTabAvailability';
import {useQuery} from '@apollo/client';
import {getGwtEngineTabs} from './engineTabs.utils';

jest.mock('./engineTabs.utils', () => {
    return {
        getGwtEngineTabs: jest.fn()
    };
});

jest.mock('@apollo/client', () => {
    return {
        useQuery: jest.fn()
    };
});

jest.mock('./engineTabs.permission.gql-query', () => {
    return {
        engineTabsPermissionCheckQuery: jest.fn()
    };
});

jest.mock('@jahia/moonstone', () => {
    return {
        EditRole: () => null,
        LiveRole: () => null,
        Version: () => null,
        Workflow: () => null
    };
});

describe('useEngineTabAvailability', () => {
    let useQueryResponse;
    let hookArgs;

    beforeEach(() => {
        jest.clearAllMocks();
        hookArgs = {
            mode: 'edit',
            site: 'digitall',
            nodeData: {
                path: '/node',
                displayName: 'A node',
                uuid: '1234-5678-8900',
                mixinTypes: [{name: 'jmix:lockable'}],
                primaryNodeType: {name: 'jnt:content', supertypes: [], hasOrderableChildNodes: false}
            }
        };

        getGwtEngineTabs.mockImplementation(() => [
            {id: 'workflow', title: 'Workflow', requiredPermission: 'viewWorkflowTab'}
        ]);

        useQueryResponse = {
            loading: false,
            error: null,
            data: {
                jcr: {
                    nodeByPath: {
                        workflow: true
                    }
                }
            }
        };
        useQuery.mockImplementation(() => useQueryResponse);
    });

    it('should return the tab when it is available and permission is granted', () => {
        const {engineTabs} = useEngineTabAvailability(hookArgs);

        expect(engineTabs).toHaveLength(1);
        expect(engineTabs[0].id).toBe('workflow');
    });

    it('should not return the tab when the permission is denied', () => {
        useQueryResponse.data = {jcr: {nodeByPath: {workflow: false}}};

        const {engineTabs} = useEngineTabAvailability(hookArgs);

        expect(engineTabs).toHaveLength(0);
    });

    it('should return tabs without required permission without querying permissions', () => {
        getGwtEngineTabs.mockImplementation(() => [
            {id: 'versioning', title: 'Versioning'}
        ]);

        const {engineTabs} = useEngineTabAvailability(hookArgs);

        expect(engineTabs).toHaveLength(1);
        expect(engineTabs[0].id).toBe('versioning');
    });

    it('should not return the tab when GWT does not provide it', () => {
        getGwtEngineTabs.mockImplementation(() => []);

        const {engineTabs} = useEngineTabAvailability(hookArgs);

        expect(engineTabs).toHaveLength(0);
    });

    it('should not return any tab outside of edit mode', () => {
        const {engineTabs} = useEngineTabAvailability({...hookArgs, mode: 'create'});

        expect(engineTabs).toHaveLength(0);
        expect(getGwtEngineTabs).not.toHaveBeenCalled();
    });

    it('should return no tabs while the permission query is loading', () => {
        useQueryResponse.loading = true;

        const {engineTabs} = useEngineTabAvailability(hookArgs);

        expect(engineTabs).toHaveLength(0);
    });
});
