import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {uploadStatuses} from '~/JContent/ContentRoute/ContentLayout/Upload/Upload.constants';
import {cePickerAddSelection, cePickerSetSelection} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {flattenTree} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';

// Stable fallback, so that a store without the jContent upload state does not hand the effect a
// new array on every render.
const NO_UPLOADS = [];

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
 * The upload panel is global and shared with jContent: it only empties itself once a whole batch
 * has succeeded, and not at all when part of it failed, so it can still hold uploads made
 * elsewhere by the time a picker opens. Whatever it holds at that point is taken as none of this
 * picker's business, leaving only the uploads that arrive while it is open.
 *
 * @param rows the nodes currently loaded in the picker, a tree in the structured views
 * @param isMultiple whether the field being edited takes more than one value
 */
export const useSelectUploadedNodes = (rows, isMultiple) => {
    const dispatch = useDispatch();

    const uploads = useSelector(state => state.jcontent?.fileUpload?.uploads || NO_UPLOADS);

    // Uploads that were already in the panel when this picker opened, by id - they were started
    // somewhere else. Null until the first pass has had a chance to look.
    const predating = useRef(null);

    // Uploads already answered for, so that a later render does not select them again - the user
    // is free to deselect what an upload selected.
    const answered = useRef(new Set());

    useEffect(() => {
        if (uploads.length === 0) {
            // The panel has been cleared, so nothing predates the picker any more and the same
            // file can be uploaded again from scratch.
            predating.current = new Set();
            answered.current = new Set();
            return;
        }

        if (predating.current === null) {
            predating.current = new Set(uploads.map(upload => upload.id));
        }

        const pending = uploads
            .filter(upload => !predating.current.has(upload.id))
            .filter(upload => upload.status === uploadStatuses.UPLOADED && upload.uuid)
            .map(upload => upload.uuid)
            .filter(uuid => !answered.current.has(uuid));

        if (pending.length === 0) {
            return;
        }

        const loaded = flattenTree(rows || []);
        const selectable = [];

        pending.forEach(uuid => {
            const node = loaded.find(row => row.uuid === uuid);
            if (!node) {
                return;
            }

            answered.current.add(uuid);

            if (node.isSelectable) {
                selectable.push(uuid);
            }
        });

        if (selectable.length === 0) {
            return;
        }

        // One action either way: adding takes a list, and setting replaces the selection, so
        // several of them would leave only the last one standing anyway.
        dispatch(isMultiple ?
            cePickerAddSelection(selectable) :
            cePickerSetSelection([selectable[selectable.length - 1]]));
    }, [dispatch, isMultiple, rows, uploads]);
};
