import React, {useState} from 'react';
import {composeActions, componentRendererAction} from '@jahia/react-material';
import requirementsAction from '../requirementsAction';
import {ContentTypeNamesQuery} from '../actions.gql-queries';
import {from} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import CreateFolderDialog from './CreateFolderDialog';

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
        let handler = context.renderComponent(<CreateFolderAction onExit={() => handler.destroy()}/>);
    }
});

const CreateFolderAction = ({onExit}) => {
    const [open, updateIsDialogOpen] = useState(true);

    const onChangeName = e => {
        // Handle validation for name change
        // @TODO implement functionality
    };
    const handleCancel = () => {
        // Close dialog
        updateIsDialogOpen(false);
        onExit();
    };
    const handleCreate = () => {
        // Do mutation to create folder.
        // @TODO implement functionality
        updateIsDialogOpen(false);
        onExit();
    };
    return (
        <CreateFolderDialog open={open}
                            onChangeName={onChangeName}
                            handleCancel={handleCancel}
                            handleCreate={handleCreate}/>
    );
};
