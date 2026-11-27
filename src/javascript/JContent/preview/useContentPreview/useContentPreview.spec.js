import React from 'react';
import {mount} from 'enzyme';
import {useContentPreview, useUnsavedValuesContext} from './useContentPreview';
import {useQuery} from '@apollo/client';
import {CONTENT_PREVIEW_QUERY, CONTENT_PREVIEW_UNSAVED_VALUES_QUERY} from './useContentPreview.gql-queries';

jest.mock('@apollo/client', () => ({
    useQuery: jest.fn(() => ({
        data: {},
        loading: false,
        error: null
    }))
}));

/** The result of the hook, called by a component as React calls a hook. */
const callHook = (hook, hookArgs) => {
    let result;
    const Probe = () => {
        result = hook(hookArgs);
        return null;
    };

    mount(React.createElement(Probe));
    return result;
};

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
        callHook(useContentPreview, args);
        expect(useQuery).toHaveBeenCalled();
    });

    it('should return empty object when return empty data', () => {
        expect(callHook(useContentPreview, args).data).toEqual({});
    });

    it('reads the stored node without unsaved values', () => {
        callHook(useContentPreview, {...args, fetchPolicy: 'network-only'});
        const [query, options] = useQuery.mock.calls.at(-1);
        expect(query).toBe(CONTENT_PREVIEW_QUERY);
        expect(options.variables.unsavedValues).toBeUndefined();
        expect(options.fetchPolicy).toBe('network-only');
        expect(options.context).toBeUndefined();
    });

    it('sends unsaved values in a request of their own, outside the cache', () => {
        const unsavedValues = {node: 'node-uuid', properties: [{name: 'text', value: 'typed', language: 'fr'}]};
        callHook(useContentPreview, {...args, fetchPolicy: 'network-only', unsavedValues});
        const [query, options] = useQuery.mock.calls.at(-1);
        expect(query).toBe(CONTENT_PREVIEW_UNSAVED_VALUES_QUERY);
        expect(options.variables.unsavedValues).toBe(unsavedValues);
        expect(options.fetchPolicy).toBe('no-cache');
        expect(options.context.headers['X-Jahia-Unsaved-Values']).toMatch(/^preview-\d+$/);
    });

    it('sends the queries of two fetchers in two batches', () => {
        const unsavedValues = {node: 'node-uuid', properties: []};
        callHook(useContentPreview, {...args, unsavedValues});
        const first = useQuery.mock.calls.at(-1)[1].context.headers['X-Jahia-Unsaved-Values'];
        callHook(useContentPreview, {...args, unsavedValues});
        const second = useQuery.mock.calls.at(-1)[1].context.headers['X-Jahia-Unsaved-Values'];
        expect(second).not.toBe(first);
    });

    it('gives each caller a header value of its own, which stays at each render', () => {
        const first = callHook(useUnsavedValuesContext, 'support');
        const second = callHook(useUnsavedValuesContext, 'support');
        expect(first.headers['X-Jahia-Unsaved-Values']).toMatch(/^support-\d+$/);
        expect(second.headers['X-Jahia-Unsaved-Values']).not.toBe(first.headers['X-Jahia-Unsaved-Values']);

        const contexts = [];
        const Probe = () => {
            contexts.push(useUnsavedValuesContext('preview'));
            return null;
        };

        const cmp = mount(React.createElement(Probe));
        cmp.setProps({});
        expect(contexts).toHaveLength(2);
        expect(contexts[1]).toBe(contexts[0]);
    });
});
