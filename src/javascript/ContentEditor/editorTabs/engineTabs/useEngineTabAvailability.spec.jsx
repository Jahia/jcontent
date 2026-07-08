import {useEngineTabAvailability} from './useEngineTabAvailability';
import {useQuery} from '@apollo/client';
import {getGwtEngineTabs} from './engineTabs.utils';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor/ContentEditor.context';

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

jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context', () => {
    return {
        useContentEditorContext: jest.fn()
    };
});

describe('useEngineTabAvailability', () => {
    let useQueryResponse;
    let contentEditorContext;

    beforeEach(() => {
        jest.clearAllMocks();
        contentEditorContext = {
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
        useContentEditorContext.mockImplementation(() => contentEditorContext);

        getGwtEngineTabs.mockImplementation(() => [
            {id: 'workflow', title: 'Workflow', requiredPermission: 'viewWorkflowTab'},
            {id: 'usages', title: 'Usages'}
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
        const {availableTabs} = useEngineTabAvailability(['workflow']);

        expect(availableTabs).toHaveLength(1);
        expect(availableTabs[0].id).toBe('workflow');
    });

    it('should not return the tab when the permission is denied', () => {
        useQueryResponse.data = {jcr: {nodeByPath: {workflow: false}}};

        const {availableTabs} = useEngineTabAvailability(['workflow']);

        expect(availableTabs).toHaveLength(0);
    });

    it('should return tabs without required permission without querying permissions', () => {
        const {availableTabs} = useEngineTabAvailability(['usages']);

        expect(availableTabs).toHaveLength(1);
        expect(availableTabs[0].id).toBe('usages');
    });

    it('should not return the tab when GWT does not provide it', () => {
        getGwtEngineTabs.mockImplementation(() => []);

        const {availableTabs} = useEngineTabAvailability(['workflow']);

        expect(availableTabs).toHaveLength(0);
    });

    it('should not return any tab outside of edit mode', () => {
        contentEditorContext.mode = 'create';

        const {availableTabs} = useEngineTabAvailability(['workflow']);

        expect(availableTabs).toHaveLength(0);
        expect(getGwtEngineTabs).not.toHaveBeenCalled();
    });

    it('should return no tabs while the permission query is loading', () => {
        useQueryResponse.loading = true;

        const {availableTabs, loading} = useEngineTabAvailability(['workflow']);

        expect(loading).toBe(true);
        expect(availableTabs).toHaveLength(0);
    });
});
