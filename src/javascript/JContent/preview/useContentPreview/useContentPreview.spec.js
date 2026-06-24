import {useContentPreview} from './useContentPreview';
import {useQuery} from '@apollo/client';

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
});
