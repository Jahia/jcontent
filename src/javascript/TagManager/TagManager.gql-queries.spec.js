import {print} from 'graphql';
import {GET_TAGGED_CONTENT} from './TagManager.gql-queries';

describe('GET_TAGGED_CONTENT', () => {
    // The uuid and workspace fields are the cache key of JCR nodes; without workspace Apollo warns on every load
    it('selects the fields Apollo needs to cache tagged nodes', () => {
        const nodesSelection = print(GET_TAGGED_CONTENT).split('nodes {')[1].split('}')[0];
        expect(nodesSelection).toMatch(/\buuid\b/);
        expect(nodesSelection).toMatch(/\bworkspace\b/);
    });
});
