import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {cePickerAddSelection, cePickerSetSelection} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {useSelectUploadedNodes} from './useSelectUploadedNodes';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
    shallowEqual: jest.fn()
}));

const dispatch = jest.fn();

const IMAGE = {uuid: 'image-uuid', path: '/files/photo.jpg', isSelectable: true};
const PDF = {uuid: 'pdf-uuid', path: '/files/brochure.pdf', isSelectable: false};

const uploaded = (...uuids) => {
    useSelector.mockImplementation(selector => selector({
        jcontent: {fileUpload: {uploads: uuids.map(uuid => ({uuid, status: 'UPLOADED'}))}}
    }));
};

const Picker = ({rows, isMultiple}) => {
    useSelectUploadedNodes(rows, isMultiple);
    return null;
};

Picker.propTypes = {rows: () => null, isMultiple: () => null};

const render = (rows, {isMultiple = false} = {}) => mount(<Picker rows={rows} isMultiple={isMultiple}/>);

describe('useSelectUploadedNodes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useDispatch.mockReturnValue(dispatch);
    });

    it('should select an uploaded file the picker accepts', () => {
        uploaded(IMAGE.uuid);

        render([IMAGE]);

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should not select an uploaded file the picker does not accept', () => {
        // The reported case: a pdf uploaded from an image picker used to end up selected, with the
        // select button enabled, even though clicking the same row does nothing.
        uploaded(PDF.uuid);

        render([PDF]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should add to the selection rather than replace it when the field takes several values', () => {
        uploaded(IMAGE.uuid);

        render([IMAGE], {isMultiple: true});

        expect(dispatch).toHaveBeenCalledWith(cePickerAddSelection(IMAGE.uuid));
    });

    it('should select only what the picker accepts out of several uploads', () => {
        uploaded(IMAGE.uuid, PDF.uuid);

        render([PDF, IMAGE], {isMultiple: true});

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(cePickerAddSelection(IMAGE.uuid));
    });

    it('should wait for an uploaded file that is not among the loaded rows yet', () => {
        uploaded(IMAGE.uuid);
        const cmp = render([]);

        expect(dispatch).not.toHaveBeenCalled();

        act(() => {
            cmp.setProps({rows: [IMAGE]});
        });

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should find an uploaded file nested in a structured view', () => {
        uploaded(IMAGE.uuid);

        render([{uuid: 'folder-uuid', path: '/files', isSelectable: false, subRows: [IMAGE]}]);

        expect(dispatch).toHaveBeenCalledWith(cePickerSetSelection([IMAGE.uuid]));
    });

    it('should not select the same upload again on a later render, so it can be deselected', () => {
        uploaded(IMAGE.uuid);
        const cmp = render([IMAGE]);

        expect(dispatch).toHaveBeenCalledTimes(1);

        act(() => {
            cmp.setProps({rows: [IMAGE, PDF]});
        });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when nothing has been uploaded', () => {
        uploaded();

        render([IMAGE]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should ignore an upload that has not finished', () => {
        useSelector.mockImplementation(selector => selector({
            jcontent: {fileUpload: {uploads: [{uuid: IMAGE.uuid, status: 'UPLOADING'}]}}
        }));

        render([IMAGE]);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('should not fail outside jContent, where no upload state exists', () => {
        useSelector.mockImplementation(selector => selector({}));

        expect(() => render([IMAGE])).not.toThrow();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
