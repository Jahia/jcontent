import {PublishNodeMutation} from './publish.gql-mutation';
import {enqueueSnackbar} from 'notistack';

export const publishNode = ({
    client,
    t,
    data: {
        nodeData,
        language
    },
    successCallback
}) => {
    return client.mutate({
        variables: {
            uuid: nodeData.uuid,
            language: language
        },
        mutation: PublishNodeMutation
    })
        .then(() => {
            enqueueSnackbar(t('jcontent:label.contentManager.publicationStatus.notification.publish'), {autoHideDuration: 3000, anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center'
            }});
            if (successCallback) {
                successCallback();
            }
        }, error => {
            console.error(error);
            enqueueSnackbar(t('jcontent:label.contentEditor.edit.action.publish.error'), {autoHideDuration: 3000, anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center'
            }});
        });
};
