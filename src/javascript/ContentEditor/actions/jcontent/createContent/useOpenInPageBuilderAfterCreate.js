import {useCallback, useRef} from 'react';
import {useApolloClient} from '@apollo/client';
import {useDispatch} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {cmGoto, setTableViewMode} from '~/JContent/redux/JContent.redux';
import JContentConstants from '~/JContent/JContent.constants';
import {getIsVisuallyEditable} from './createContent.gql-queries';

/**
 * A content created in a content folder that can open in the Page Builder is what the editor works on next: once
 * the Content Editor closes, land on it in the Page Builder, as New Page does for a page. Content created inside
 * another content (an area, a form) stays where it is, the editor is working on that parent. The navigation waits
 * for the editor to close so that "create another" and the fullscreen redirect to edit mode keep their flow; with
 * several contents created in a row, the last one is the one opened.
 *
 * @returns the create and closed callbacks to hand to the Content Editor, wrapping the ones given
 */
export const useOpenInPageBuilderAfterCreate = ({isEnabled, parentNode, onCreate, onClosed}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const createdNode = useRef(null);

    const handleCreate = useCallback((newNode, config) => {
        createdNode.current = newNode;
        onCreate?.(newNode, config);
    }, [onCreate]);

    const handleClosed = useCallback((...args) => {
        onClosed?.(...args);
        const newNode = createdNode.current;
        createdNode.current = null;
        if (!isEnabled || !newNode || parentNode?.primaryNodeType?.name !== 'jnt:contentFolder') {
            return;
        }

        client.query({
            query: getIsVisuallyEditable,
            variables: {uuid: newNode.uuid, visuallyEditableNodeType: JContentConstants.visuallyEditableNodeType}
        }).then(({data}) => {
            if (data?.jcr?.nodeById?.isVisuallyEditable) {
                dispatch(batchActions([
                    cmGoto({path: newNode.path}),
                    setTableViewMode(JContentConstants.tableView.viewMode.PAGE_BUILDER)
                ]));
            }
        }).catch(e => {
            console.error('Could not tell whether the created content opens in the Page Builder', e);
        });
    }, [isEnabled, parentNode, onClosed, client, dispatch]);

    return {handleCreate, handleClosed};
};
