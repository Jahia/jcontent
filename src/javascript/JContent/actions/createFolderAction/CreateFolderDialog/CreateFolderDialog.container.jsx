import React, {useEffect, useState} from 'react';
import {CreateFolderQuery} from './CreateFolderDialog.gql-queries';
import {CreateFolderMutation} from './CreateFolderDialog.gql-mutations';
import PropTypes from 'prop-types';
import CreateFolderDialog from './CreateFolderDialog';
import {triggerRefetchAll} from '../../../JContent.refetches';
import {useApolloClient, useQuery, useMutation} from '@apollo/react-hooks';

const CreateFolderDialogContainer = ({path, contentType, onExit}) => {
    const [open, updateIsDialogOpen] = useState(true);
    const [name, updateName] = useState('');
    const [isNameValid, updateIsNameValid] = useState(true);
    const [isNameAvailable, updateIsNameAvailable] = useState(true);
    const [childNodes, updateChildNodes] = useState([]);

    const invalidRegex = /[\\/:*?"<>|]/g;
    const gqlParams = {
        mutation: {
            parentPath: path,
            primaryNodeType: contentType
        },
        query: {
            path: path
        }
    };

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

    const client = useApolloClient();
    const {loading, data} = useQuery(CreateFolderQuery, {variables: gqlParams.query, fetchPolicy: 'network-only'});
    const [mutation] = useMutation(CreateFolderMutation, {
        onCompleted: () => {
            client.cache.flushNodeEntryByPath(path);
            triggerRefetchAll();
        }
    });

    useEffect(() => {
        if (data && data.jcr && data.jcr.nodeByPath) {
            updateChildNodes(data.jcr.nodeByPath.children.nodes);
        }
    }, [data, updateChildNodes]);

    return (
        <CreateFolderDialog isOpen={open}
                            name={name}
                            isLoading={loading}
                            isNameValid={isNameValid}
                            isNameAvailable={isNameAvailable}
                            handleCancel={handleCancel}
                            handleCreate={() => handleCreate(mutation)}
                            onChangeName={onChangeName}/>
    );
};

CreateFolderDialogContainer.propTypes = {
    path: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

export default CreateFolderDialogContainer;
