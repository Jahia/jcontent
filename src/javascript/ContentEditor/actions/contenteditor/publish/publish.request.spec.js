import {publishNode} from './publishNode';
import {enqueueSnackbar} from 'notistack';

jest.mock('./publish.gql-mutation', () => {
    return {
        PublishNodeMutation: 'PublishNodeMutation'
    };
});

jest.mock('notistack', () => ({
    enqueueSnackbar: jest.fn()
}));

describe('publish', () => {
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
                mutate: jest.fn(() => Promise.resolve())
            },
            actions: {setSubmitting: jest.fn()},
            t: jest.fn(),
            data: {
                nodeData: {}
            }
        };
    });

    it('should call PublishNodeMutation', async () => {
        await publishNode(params);

        expect(params.client.mutate).toHaveBeenCalled();
        expect(params.client.mutate.mock.calls[0][0].mutation).toBe('PublishNodeMutation');
    });

    it('should display a notification when request is a success', async () => {
        await publishNode(params);

        expect(enqueueSnackbar).toHaveBeenCalled();
    });

    it('should display a notification when request is a failure', async () => {
        params.client.mutate = () => Promise.reject();
        await publishNode(params);

        expect(enqueueSnackbar).toHaveBeenCalled();
    });

    it('should log error when request is a failure', async () => {
        const err = new Error('yo');
        params.client.mutate = () => Promise.reject(err);
        await publishNode(params);

        expect(console.error).toHaveBeenCalledWith(err);
    });
});
