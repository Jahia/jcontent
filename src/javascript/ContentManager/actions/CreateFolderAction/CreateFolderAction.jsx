import React, {useState} from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {ContentTypeNamesQuery} from '../actions.gql-queries';
import {from} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import CreateFolderDialog from './CreateFolderDialog';
import {Mutation} from 'react-apollo';
import {CreateFolderMutation} from './CreateFolderAction.gql-mutations';

export default composeActions(requirementsAction, componentRendererAction, {
    init: context => {
        context.initRequirements({requiredPermission: 'jcr:addChildNodes'});

        if (!context.buttonLabel) {
            // Label.contentManager.create.contentFolder
            context.buttonLabel = 'label.contentManager.create.folder';
            let watchQuery = context.client.watchQuery({
                query: ContentTypeNamesQuery,
                variables: {nodeTypes: [context.contentType], displayLanguage: context.dxContext.uilang}
            });

            context.buttonLabelParams = from(watchQuery).pipe(
                filter(res => (res.data && res.data.jcr && res.data.jcr.nodeByPath)),
                map(res => ({typeName: res.data.jcr.nodeTypesByNames[0].displayName}))
            );
        }
    },
    onClick: context => {
        let handler = context.renderComponent(<CreateFolderAction node={context.node} contentType={context.contentType} onExit={() => handler.destroy()}/>);
    }
});

const CreateFolderAction = ({node, contentType, onExit}) => {
    const [open, updateIsDialogOpen] = useState(true);
    const [name, updateName] = useState(undefined);
    const [isNameValid, updateIsNameValid] = useState(true);

    const invalidRegex = /[\\/:*?"<>|]/g;
    const variables = {
        parentPath: node.path,
        primaryNodeType: contentType
    };

    const onChangeName = e => {
        // Handle validation for name change
        updateIsNameValid(e.target.value && e.target.value.match(invalidRegex) === null);
        updateName(e.target.value);
    };
    const handleCancel = () => {
        // Close dialog
        updateIsDialogOpen(false);
        onExit();
    };
    const handleCreate = mutation => {
        // Do mutation to create folder.
        variables.folderName = name;
        mutation({variables: variables});
        updateIsDialogOpen(false);
        onExit();
    };
    return (
        <Mutation mutation={CreateFolderMutation} refetchQueries={() => ['PickerQuery', 'getNodeSubTree']}>
            {mutation => (
                <CreateFolderDialog open={open}
                                    name={name}
                                    isNameValid={isNameValid}
                                    onChangeName={onChangeName}
                                    handleCancel={handleCancel}
                                    handleCreate={() => handleCreate(mutation)}/>
        )}
        </Mutation>
    );
};
