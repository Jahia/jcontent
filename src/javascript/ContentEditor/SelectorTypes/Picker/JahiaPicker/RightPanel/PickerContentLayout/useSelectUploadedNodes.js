import {useEffect, useRef} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {batchActions} from 'redux-batched-actions';
import {uploadStatuses} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.constants';
import {cePickerAddSelection, cePickerSetSelection} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {flattenTree} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';

/**
 * Selects a file the user has just uploaded from inside the picker, once it appears among the
 * loaded rows and only if that row says it can be selected.
 *
 * Uploading is offered by the picker because what comes back is usually what the user came to
 * pick, so selecting it saves them looking for it. It is not always selectable though: upload
 * accepts any file, while an image picker only accepts images, and a document standing as the
 * value of an image field is the very thing that field is meant to refuse.
 *
 * isSelectable carries the picker's own restriction, evaluated server side, and is what a click
 * on a row already obeys - so an upload obeys it too, rather than writing into the selection on
 * its own. A file that is not among the rows yet is left pending: uploading triggers a refetch,
 * and it gets picked up on the render where it arrives.
 *
 * @param rows the nodes currently loaded in the picker, a tree in the structured views
 * @param isMultiple whether the field being edited takes more than one value
 */
export const useSelectUploadedNodes = (rows, isMultiple) => {
    const dispatch = useDispatch();

    const uploadedUuids = useSelector(state => (state.jcontent?.fileUpload?.uploads || [])
        .filter(upload => upload.status === uploadStatuses.UPLOADED && upload.uuid)
        .map(upload => upload.uuid), shallowEqual);

    // Uploads already answered for, so that a later render does not select them again - the user
    // is free to deselect what an upload selected.
    const answered = useRef(new Set());

    useEffect(() => {
        if (uploadedUuids.length === 0) {
            // The panel has been cleared, so the same file can be uploaded again from scratch.
            answered.current = new Set();
            return;
        }

        const pending = uploadedUuids.filter(uuid => !answered.current.has(uuid));
        if (pending.length === 0) {
            return;
        }

        const loaded = flattenTree(rows || []);
        const actions = [];

        pending.forEach(uuid => {
            const node = loaded.find(row => row.uuid === uuid);
            if (!node) {
                return;
            }

            answered.current.add(uuid);

            if (node.isSelectable) {
                actions.push(isMultiple ? cePickerAddSelection(uuid) : cePickerSetSelection([uuid]));
            }
        });

        if (actions.length > 0) {
            dispatch(actions.length === 1 ? actions[0] : batchActions(actions));
        }
    }, [dispatch, isMultiple, rows, uploadedUuids]);
};
