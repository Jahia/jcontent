import {print} from 'graphql';
import {buildBulkDocument, bulkMutate, failedItems} from './bulkMutate';

const items = count => Array.from({length: count}, (_, index) => ({path: `/sites/test/contents/item${index}`}));

const buildItem = (item, index) => ({
    declarations: [`$value${index}: String!`],
    variables: {[`value${index}`]: `value of ${item.path}`},
    selection: `mutateProperty(name: "title") { setValue(value: $value${index}) }`
});

describe('buildBulkDocument', () => {
    it('should alias one mutateNode per item and pass every variable', () => {
        const {document, variables} = buildBulkDocument({items: items(2), buildItem, sharedDeclarations: ['$language: String']});
        const printed = print(document);
        expect(printed).toContain('n0: mutateNode(pathOrId: $path0)');
        expect(printed).toContain('n1: mutateNode(pathOrId: $path1)');
        expect(printed).toContain('$language: String');
        expect(variables).toEqual({
            path0: '/sites/test/contents/item0',
            value0: 'value of /sites/test/contents/item0',
            path1: '/sites/test/contents/item1',
            value1: 'value of /sites/test/contents/item1'
        });
    });
});

describe('failedItems', () => {
    it('should map an error to the item of its alias', () => {
        const batch = items(3);
        expect(failedItems(batch, [{path: ['jcr', 'n1', 'mutateProperty'], message: 'denied'}]))
            .toEqual([{path: '/sites/test/contents/item1', message: 'denied'}]);
    });

    it('should fail the whole batch for an error without an alias', () => {
        expect(failedItems(items(2), [{message: 'broken'}]).map(failure => failure.path))
            .toEqual(['/sites/test/contents/item0', '/sites/test/contents/item1']);
    });

    it('should report nothing without errors', () => {
        expect(failedItems(items(2), undefined)).toEqual([]);
    });
});

describe('bulkMutate', () => {
    it('should send one request per batch and report the saved and failed items', async () => {
        const client = {
            mutate: jest.fn()
                .mockResolvedValueOnce({errors: [{path: ['jcr', 'n0'], message: 'denied'}]})
                .mockResolvedValueOnce({})
        };
        const result = await bulkMutate({client, items: items(3), buildItem, batchSize: 2});
        expect(client.mutate).toHaveBeenCalledTimes(2);
        expect(client.mutate.mock.calls[0][0].errorPolicy).toEqual('all');
        expect(result.failed).toEqual([{path: '/sites/test/contents/item0', message: 'denied'}]);
        expect(result.saved).toEqual(['/sites/test/contents/item1', '/sites/test/contents/item2']);
    });

    it('should continue after a batch that throws', async () => {
        const client = {
            mutate: jest.fn()
                .mockRejectedValueOnce(new Error('network'))
                .mockResolvedValueOnce({})
        };
        const result = await bulkMutate({client, items: items(3), buildItem, batchSize: 2});
        expect(result.failed.map(failure => failure.path)).toEqual(['/sites/test/contents/item0', '/sites/test/contents/item1']);
        expect(result.saved).toEqual(['/sites/test/contents/item2']);
    });
});
