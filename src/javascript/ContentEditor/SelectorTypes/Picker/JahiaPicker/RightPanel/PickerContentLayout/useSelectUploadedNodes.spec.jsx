import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {cePickerAddSelection, cePickerSetSelection} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {useSelectUploadedNodes} from './useSelectUploadedNodes';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn()
}));

const dispatch = jest.fn();

const IMAGE = {uuid: 'image-uuid', path: '/files/photo.jpg', isSelectable: true};
const OTHER_IMAGE = {uuid: 'other-image-uuid', path: '/files/drawing.jpg', isSelectable: true};
const PDF = {uuid: 'pdf-uuid', path: '/files/brochure.pdf', isSelectable: false};

const upload = (node, status = 'UPLOADED') => ({id: `upload-${node.uuid}`, uuid: node.uuid, status});

const panelHolds = entries => {
    useSelector.mockImplementation(selector => selector({
        jcontent: {fileUpload: {uploads: entries}}
    }));
};

const Picker = ({rows, isMultiple}) => {
    useSelectUploadedNodes(rows, isMultiple);
    return null;
};

Picker.propTypes = {rows: () => null, isMultiple: () => null};

/**
 * A picker opens on whatever the upload panel already holds and the user uploads from inside it,
 * so the cases follow that sequence rather than mounting on a finished upload: arrive() is the
 * upload completing, with the rows the refetch brings back.
 */
const openPicker = ({rows = [], isMultiple = false, holding = []} = {}) => {
    panelHolds(holding);
    const cmp = mount(<Picker rows={rows} isMultiple={isMultiple}/>);
    let current = rows;

    const rerender = nextRows => {
        current = nextRows === undefined ? current : nextRows;
        act(() => {
            cmp.setProps({rows: current});
        });
    };

    return {
        rerender,
        arrive: (entries, nextRows) => {
            panelHolds([...holding, ...entries]);
            rerender(nextRows);
        }
    };
};

describe('useSelectUploadedNodes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useDispatch.mockReturnValue(dispatch);
    });

    it('should select an uploaded file the picker accepts', () => {
        const picker = openPicker();

        picker.arrive([upload(IMAGE)], [IMAGE]);

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should not select an uploaded file the picker does not accept', () => {
        // The reported case: a pdf uploaded from an image picker used to end up selected, with the
        // select button enabled, even though clicking the same row does nothing.
        const picker = openPicker();

        picker.arrive([upload(PDF)], [PDF]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should add to the selection rather than replace it when the field takes several values', () => {
        const picker = openPicker({isMultiple: true});

        picker.arrive([upload(IMAGE)], [IMAGE]);

        expect(dispatch).toHaveBeenCalledWith(cePickerAddSelection([IMAGE.uuid]));
    });

    it('should select only what the picker accepts out of several uploads', () => {
        const picker = openPicker({isMultiple: true});

        picker.arrive([upload(PDF), upload(IMAGE)], [PDF, IMAGE]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(cePickerAddSelection([IMAGE.uuid]));
    });

    it('should add several accepted uploads in one action', () => {
        const picker = openPicker({isMultiple: true});

        picker.arrive([upload(IMAGE), upload(OTHER_IMAGE)], [IMAGE, OTHER_IMAGE]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(cePickerAddSelection([IMAGE.uuid, OTHER_IMAGE.uuid]));
    });

    it('should keep the last accepted upload when the field takes one value', () => {
        // Setting the selection replaces it, so one action per upload would leave only the last
        // standing anyway - it is stated here rather than arrived at through a batch.
        const picker = openPicker();

        picker.arrive([upload(IMAGE), upload(OTHER_IMAGE)], [IMAGE, OTHER_IMAGE]);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([OTHER_IMAGE.uuid]));
    });

    it('should ignore an upload the panel was already holding when the picker opened', () => {
        // The panel is global and outlives a picker: it only empties itself once a whole batch has
        // succeeded, and not at all when part of it failed. An upload made in jContent beforehand
        // is not what the user came into this picker to pick.
        const picker = openPicker({holding: [upload(IMAGE)]});

        picker.rerender([IMAGE]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should still select an upload made after one the panel was already holding', () => {
        const picker = openPicker({holding: [upload(PDF)]});

        picker.arrive([upload(IMAGE)], [PDF, IMAGE]);

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should wait for an uploaded file that is not among the loaded rows yet', () => {
        const picker = openPicker();

        picker.arrive([upload(IMAGE)]);

        expect(dispatch).not.toHaveBeenCalled();

        picker.rerender([IMAGE]);

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should find an uploaded file nested in a structured view', () => {
        const picker = openPicker();

        picker.arrive([upload(IMAGE)], [{uuid: 'folder-uuid', path: '/files', isSelectable: false, subRows: [IMAGE]}]);

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should not select the same upload again on a later render, so it can be deselected', () => {
        const picker = openPicker();

        picker.arrive([upload(IMAGE)], [IMAGE]);

        expect(dispatch).toHaveBeenCalledTimes(1);

        picker.rerender([IMAGE, PDF]);

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when nothing has been uploaded', () => {
        const picker = openPicker();

        picker.rerender([IMAGE]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should ignore an upload that has not finished', () => {
        const picker = openPicker();

        picker.arrive([upload(IMAGE, 'UPLOADING')], [IMAGE]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should not fail outside jContent, where no upload state exists', () => {
        useSelector.mockImplementation(selector => selector({}));

        expect(() => mount(<Picker rows={[IMAGE]} isMultiple={false}/>)).not.toThrow();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
