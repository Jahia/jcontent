import {buildMarkForDeletionSnapshot, invertMarkForDeletion, MARK_FOR_DELETION_UNDO} from './delete.undo';
import {UndeleteMutation} from './delete.gql-mutation';

jest.mock('~/JContent/undo', () => ({
    registerUndoHandler: jest.fn()
}));

describe('buildMarkForDeletionSnapshot', () => {
    it('should record the paths the dialog acted on', () => {
        const snapshot = buildMarkForDeletionSnapshot({paths: ['/a', '/b'], displayName: 'News'});

        expect(snapshot).toEqual({
            kind: MARK_FOR_DELETION_UNDO,
            label: 'News',
            count: 2,
            paths: ['/a', '/b']
        });
    });

    it('should cope with no paths at all', () => {
        expect(buildMarkForDeletionSnapshot({})).toEqual({
            kind: MARK_FOR_DELETION_UNDO,
            label: undefined,
            count: 0,
            paths: []
        });
    });
});

describe('invertMarkForDeletion', () => {
    it('should unmark every path it was given', async () => {
        const client = {mutate: jest.fn().mockResolvedValue({})};

        const {failures} = await invertMarkForDeletion({paths: ['/a', '/b']}, {client});

        expect(client.mutate).toHaveBeenCalledTimes(2);
        expect(client.mutate).toHaveBeenCalledWith({mutation: UndeleteMutation, variables: {path: '/a'}});
        expect(client.mutate).toHaveBeenCalledWith({mutation: UndeleteMutation, variables: {path: '/b'}});
        expect(failures).toEqual([]);
    });

    it('should report the paths that could not be unmarked, and still unmark the others', async () => {
        const error = new Error('javax.jcr.AccessDeniedException');
        const client = {
            mutate: jest.fn(({variables}) => (variables.path === '/b' ? Promise.reject(error) : Promise.resolve({})))
        };

        const {failures} = await invertMarkForDeletion({paths: ['/a', '/b', '/c']}, {client});

        expect(client.mutate).toHaveBeenCalledTimes(3);
        expect(failures).toEqual([{path: '/b', error}]);
    });

    it('should do nothing, successfully, for a snapshot with no paths', async () => {
        const client = {mutate: jest.fn()};

        const {failures} = await invertMarkForDeletion({}, {client});

        expect(client.mutate).not.toHaveBeenCalled();
        expect(failures).toEqual([]);
    });
});
