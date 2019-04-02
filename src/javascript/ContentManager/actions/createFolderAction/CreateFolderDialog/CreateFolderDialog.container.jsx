import {Mutation, Query} from 'react-apollo';
import React, {useState} from 'react';
import {CreateFolderQuery} from './CreateFolderDialog.gql-queries';
import {CreateFolderMutation} from './CreateFolderDialog.gql-mutations';
import PropTypes from 'prop-types';
import CreateFolderDialog from './CreateFolderDialog';

const CreateFolderDialogContainer = ({node, contentType, onExit}) => {
    const [open, updateIsDialogOpen] = useState(true);
    const [name, updateName] = useState('');
    const [isNameValid, updateIsNameValid] = useState(true);
    const [isNameAvailable, updateIsNameAvailable] = useState(true);
    const [childNodes, updateChildNodes] = useState([]);

    const invalidRegex = /[\\/:*?"<>|]/g;
    const gqlParams = {
        mutation: {
            parentPath: node.path,
            primaryNodeType: contentType
        },
        query: {
            path: node.path,
            typesFilter: {
                types: [contentType]
            }
        }
    };

    const refetchQueries = ['PickerQuery'];
    if (contentType === 'jnt:folder') {
        refetchQueries.push('getFiles');
    } else if (contentType === 'jnt:contentFolder') {
        refetchQueries.push('getNodeSubTree');
    }

    const onChangeName = e => {
        // Handle validation for name change
        updateIsNameValid(e.target.value && e.target.value.match(invalidRegex) === null);
        updateIsNameAvailable(childNodes.find(node => node.name === e.target.value) === undefined);
        updateName(e.target.value);
    };
    const handleCancel = () => {
        // Close dialog
        updateIsDialogOpen(false);
        onExit();
    };
    const handleCreate = mutation => {
        // Do mutation to create folder.
        gqlParams.mutation.folderName = name;
        mutation({variables: gqlParams.mutation});
        updateIsDialogOpen(false);
        onExit();
    };
    return (
        <Query query={CreateFolderQuery} variables={gqlParams.query} fetchPolicy="cache-first">
            {({loading, data}) => {
                if (data && data.jcr && data.jcr.nodeByPath) {
                    updateChildNodes(data.jcr.nodeByPath.children.nodes);
                }
                return (
                    <Mutation mutation={CreateFolderMutation} refetchQueries={() => refetchQueries}>
                        {mutation => (
                            <CreateFolderDialog open={open}
                                                name={name}
                                                loading={loading}
                                                isNameValid={isNameValid}
                                                isNameAvailable={isNameAvailable}
                                                handleCancel={handleCancel}
                                                handleCreate={() => handleCreate(mutation)}
                                                onChangeName={onChangeName}/>
                        )}
                    </Mutation>
                );
            }}
        </Query>
    );
};

CreateFolderDialogContainer.propTypes = {
    node: PropTypes.object.isRequired,
    contentType: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

export default CreateFolderDialogContainer;
