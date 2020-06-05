import {useMutation} from '@apollo/react-hooks';
import pasteMutations from '../../../actions/copyPaste/copyPaste.gql-mutations';

export const useDropTarget = ({parent, element, onSaved, enabledClassName}) => {
    const dropClassName = 'dropTarget';
    const [paste] = useMutation(pasteMutations.moveNode);

    const onDragOver = e => {
        e.preventDefault(); // Necessary. Allows us to drop.
        e.dataTransfer.dropEffect = 'move';
        return false;
    };

    const onDragEnter = e => {
        e.preventDefault(); // Necessary. Allows us to drop.
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add(enabledClassName);
    };

    const onDragLeave = e => {
        e.currentTarget.classList.remove(enabledClassName);
    };

    const onDrop = e => {
        e.stopPropagation();

        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        e.currentTarget.classList.remove(enabledClassName);

        // Execute paste
        paste({
            variables: {
                pathOrId: element.ownerDocument.getElementById(data.sourceElement).getAttribute('path'),
                destParentPathOrId: parent.getAttribute('path')
            }
        }).then(() => {
            onSaved();
        });

        return false;
    };

    return {
        dropClassName,
        onDragEnter,
        onDragOver,
        onDragLeave,
        onDrop
    };
};
