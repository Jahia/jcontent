import {PublishNodeMutation} from './publish.gql-mutation';

export const publishNode = ({
    client,
    data: {
        nodeData,
        language
    }
}) => {
    return client.mutate({
        variables: {
            uuid: nodeData.uuid,
            language: language
        },
        mutation: PublishNodeMutation
    })
        .then(() => {}, error => {
            console.error(error);
        });
};
