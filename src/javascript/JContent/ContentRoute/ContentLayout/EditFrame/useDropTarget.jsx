import {useMutation} from '@apollo/react-hooks';
import styles from './EditFrame.scss';

import gql from 'graphql-tag';

const moveNode = gql`mutation moveNode($pathOrId: String!, $destParentPathOrId: String!, $name:String, $next: String, $move: Boolean!, $reorder: Boolean!) {
    jcr {
        pasteNode(mode: MOVE, pathOrId: $pathOrId, destParentPathOrId: $destParentPathOrId, namingConflictResolution: RENAME) @include(if: $move) {
            node {
                path
            }
        }
        mutateNode(pathOrId: $destParentPathOrId) @include(if: $reorder) {
            reorderChildren(names: [$name, $next])
        }
    }
}`;

export const useDropTarget = ({parent, element, onSaved, enabledClassName}) => {
    const dropClassName = styles.enablePointerEvents;
    const [paste] = useMutation(moveNode);

    const onDragOver = e => {
        e.preventDefault(); // Necessary. Allows us to drop.
        e.dataTransfer.dropEffect = 'move';
        return false;
    };

    const onDragEnter = e => {
        e.preventDefault(); // Necessary. Allows us to drop.
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add(enabledClassName);
    };

    const onDragLeave = e => {
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'none';
        e.currentTarget.classList.remove(enabledClassName);
    };

    const onDrop = e => {
        e.stopPropagation();

        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        e.currentTarget.classList.remove(enabledClassName);

        const pathOrId = element.ownerDocument.getElementById(data.sourceElement).getAttribute('path');
        const destParentPathOrId = parent.getAttribute('path');
        const variables = {
            pathOrId,
            destParentPathOrId,
            move: false,
            reorder: false
        };

        if (destParentPathOrId !== pathOrId.substr(0, pathOrId.lastIndexOf('/'))) {
            variables.move = true;
        }

        const next = element.getAttribute('path');
        if (next !== '*') {
            variables.reorder = true;
            variables.name = pathOrId.substr(pathOrId.lastIndexOf('/') + 1);
            variables.next = next.substr(next.lastIndexOf('/') + 1);
        }

        // Execute paste
        paste({
            variables
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
