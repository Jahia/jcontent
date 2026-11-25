import {useContentPreview, UNSAVED_VALUES_SUPPORT_CONTEXT} from './useContentPreview';
import {useQuery} from '@apollo/client';
import {CONTENT_PREVIEW_QUERY, CONTENT_PREVIEW_UNSAVED_VALUES_QUERY} from './useContentPreview.gql-queries';

jest.mock('@apollo/client', () => ({
    useQuery: jest.fn(() => ({
        data: {},
        loading: false,
        error: null
    }))
}));

describe('useContentPreview', () => {
    let args;
    beforeEach(() => {
        args = {
            path: 'site/digitall',
            workspace: 'home',
            language: 'fr',
            templateType: 'player',
            view: 'partial',
            contextConfiguration: 'cc',
            requestAttributes: 'attrs'
        };
    });

    it('should trigger a graphql request', () => {
        useContentPreview(args);
        expect(useQuery).toHaveBeenCalled();
    });

    it('should return empty object when return empty data', () => {
        expect(useContentPreview(args).data).toEqual({});
    });

    it('reads the stored node without unsaved values', () => {
        useContentPreview({...args, fetchPolicy: 'network-only'});
        const [query, options] = useQuery.mock.calls.at(-1);
        expect(query).toBe(CONTENT_PREVIEW_QUERY);
        expect(options.variables.unsavedValues).toBeUndefined();
        expect(options.fetchPolicy).toBe('network-only');
        expect(options.context).toBeUndefined();
    });

    it('sends unsaved values in a request of their own, outside the cache', () => {
        const unsavedValues = {node: 'node-uuid', properties: [{name: 'text', value: 'typed', language: 'fr'}]};
        useContentPreview({...args, fetchPolicy: 'network-only', unsavedValues});
        const [query, options] = useQuery.mock.calls.at(-1);
        expect(query).toBe(CONTENT_PREVIEW_UNSAVED_VALUES_QUERY);
        expect(options.variables.unsavedValues).toBe(unsavedValues);
        expect(options.fetchPolicy).toBe('no-cache');
        expect(options.context.headers).toEqual({'X-Jahia-Unsaved-Values': 'preview'});
        // The support query travels in a batch of its own too.
        expect(UNSAVED_VALUES_SUPPORT_CONTEXT.headers).toEqual({'X-Jahia-Unsaved-Values': 'support'});
    });
});
