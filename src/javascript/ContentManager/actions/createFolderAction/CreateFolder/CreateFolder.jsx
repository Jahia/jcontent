import React, {useState} from 'react';
import CreateFolderDialog from './CreateFolderDialog';
import PropTypes from 'prop-types';

const CreateFolder = ({mutation, node, loading, childNodes, contentType, onExit}) => {
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
        variables.folderName = name;
        mutation({variables: variables});
        updateIsDialogOpen(false);
        onExit();
    };
    return (
        <CreateFolderDialog open={open}
                            name={name}
                            loading={loading}
                            isNameValid={isNameValid}
                            isNameAvailable={isNameAvailable}
                            handleCancel={handleCancel}
                            handleCreate={() => handleCreate(mutation)}
                            onChangeName={onChangeName}/>
    );
};

CreateFolder.propTypes = {
    childNodes: PropTypes.array.isRequired,
    node: PropTypes.object.isRequired,
    contentType: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    mutation: PropTypes.func.isRequired,
    onExit: PropTypes.func.isRequired
};

export default CreateFolder;
