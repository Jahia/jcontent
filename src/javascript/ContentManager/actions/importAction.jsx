import {composeActions} from '@jahia/react-material';
import requirementsAction from './requirementsAction';
import {withApolloAction} from './withApolloAction';
import gql from 'graphql-tag';

const importMutation = gql`mutation importContent($path: String!, $name: String!, $file: String!, $type: FileType!){
          jcr {
            importNode(parentPathOrId: $path, name: $name, file: $file, type: $type)
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
            let type = files[0].type === 'application/zip' ? 'ZIP' : 'XML';
            context.client.mutate({
                mutation: importMutation,
                variables: {
                    path: context.path,
                    file: files[0],
                    name: files[0].name,
                    type: type
                }
            });
        });
    },

    onClick: () => {
        let input = document.getElementById('file-import-input');
        input.click();
    }
});
