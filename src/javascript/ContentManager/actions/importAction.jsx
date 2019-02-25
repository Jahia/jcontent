import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withApolloAction} from './withApolloAction';
import gql from 'graphql-tag';

const importMutation = gql`mutation importContent($path: String!, $file: String!){
          jcr {
            importNode(parentPathOrId: $path, file: $file)
          }
        }`;

export default composeActions(requirementsAction, withApolloAction, {
    init: context => {
        context.initRequirements({
            requiredPermission: 'jcr:addChildNodes'
        });
        let element = document.getElementById('file-import-input');
        if (element !== null) {
            element.remove();
        }
        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('multiple', 'true');
        input.setAttribute('accept', 'text/xml,application/zip,application/x-zip,application/x-zip-compressed');
        input.setAttribute('id', 'file-import-input');
        document.body.appendChild(input);
        input.addEventListener('change', e => {
            e.stopPropagation();
            let files = Array.from(input.files);
            context.client.mutate({
                mutation: importMutation,
                variables: {
                    path: context.path,
                    file: files[0]
                }
            });
        });
    },

    onClick: () => {
        let input = document.getElementById('file-import-input');
        input.click();
    }
});
