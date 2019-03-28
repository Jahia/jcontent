import React, {useState} from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import CreateFolderDialog from './CreateFolderDialog';
import {Mutation, Query} from 'react-apollo';
import {CreateFolderMutation} from './CreateFolderAction.gql-mutations';
import {CreateFolderQuery} from './CreateFolderAction.gql-queries';

export default composeActions(requirementsAction, componentRendererAction, {
    init: context => {
        context.initRequirements({requiredPermission: 'jcr:addChildNodes'});
    },
    onClick: context => {
        const variables = {
            path: context.node.path,
            typesFilter: {
                types: [context.contentType]
            }
        };
        let handler = context.renderComponent(
            <Query query={CreateFolderQuery} variables={variables} fetchPolicy="cache-first">
                {({loading, error, data}) => {
                    let childNodes = [];
                    if (data && data.jcr && data.jcr.nodeByPath) {
                        childNodes = data.jcr.nodeByPath.children.nodes;
                    }
                    return (
                        <CreateFolderAction children={childNodes}
                                            contentType={context.contentType}
                                            loading={loading}
                                            node={context.node}
                                            onExit={() => handler.destroy()}/>
);
                }}
            </Query>
        );
    }
});

const CreateFolderAction = ({node, loading, children, contentType, onExit}) => {
    const [open, updateIsDialogOpen] = useState(true);
    const [name, updateName] = useState(undefined);
    const [isNameValid, updateIsNameValid] = useState(true);
    const [isNameAvailable, updateIsNameAvailable] = useState(true);

    const invalidRegex = /[\\/:*?"<>|]/g;
    const variables = {
        parentPath: node.path,
        primaryNodeType: contentType
    };

    const onChangeName = e => {
        // Handle validation for name change
        updateIsNameValid(e.target.value && e.target.value.match(invalidRegex) === null);
        updateIsNameAvailable(children.find(node => node.name === e.target.value) === undefined);
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
                                    loading={loading}
                                    isNameValid={isNameValid}
                                    isNameAvailable={isNameAvailable}
                                    onChangeName={onChangeName}
                                    handleCancel={handleCancel}
                                    handleCreate={() => handleCreate(mutation)}/>
        )}
        </Mutation>
    );
};
