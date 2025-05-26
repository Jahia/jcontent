import {useMediaPickerInputData} from './useMediaPickerInputData';
import {setQueryResponseMock} from '@apollo/client';
import {useContentEditorContext} from '~/ContentEditor/contexts';

jest.mock('@apollo/client', () => {
    let queryresponsemock;
    return {
        useQuery: () => queryresponsemock,
        setQueryResponseMock: r => {
            queryresponsemock = r;
        }
    };
});

jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context');

describe('useMediaPickerInputData', () => {
    let contentEditorContext;
    beforeEach(() => {
        contentEditorContext = {
            lang: 'fr'
        };
        useContentEditorContext.mockReturnValue(contentEditorContext);
    });

    window.contextJsParameters = {
        contextPath: 'localContextPath'
    };

    it('should return no data, no error when loading', () => {
        setQueryResponseMock({loading: true});
        expect(useMediaPickerInputData('uuid', {lang: 'fr'})).toEqual({loading: true, notFound: true});
    });

    it('should return no data when there is no uuid given', () => {
        setQueryResponseMock({loading: false, data: {}});
        expect(useMediaPickerInputData('', {lang: 'fr'})).toEqual({loading: false, notFound: false});
    });

    it('should return error when there is error', () => {
        setQueryResponseMock({loading: false, error: 'oops'});
        expect(useMediaPickerInputData('uuid', {lang: 'fr'})).toEqual({loading: false, error: 'oops', notFound: true});
    });

    it('should return not found when the resource has been removed', () => {
        setQueryResponseMock({loading: false, data: undefined, error: undefined});
        expect(useMediaPickerInputData('uuid', {lang: 'fr'})).toEqual({loading: false, notFound: true});
    });

    it('should adapt data when graphql return some data', () => {
        setQueryResponseMock({loading: false, data: {
            jcr: {
                result: [{
                    uuid: 'this-is-uuid',
                    height: {value: '1080'},
                    width: {value: '1920'},
                    lastModified: {value: 'tomorrow'},
                    displayName: 'a cake',
                    name: 'cake',
                    path: 'placeholder.jpg',
                    content: {
                        mimeType: {value: 'image/jpeg'},
                        data: {size: 1000000}
                    },
                    thumbnailUrl: 'http://placeholder.jpg?t=thumbnail2'
                }]
            }
        }});

        expect(useMediaPickerInputData('this-is-uuid', {lang: 'fr'})).toEqual({
            loading: false,
            error: undefined,
            fieldData: [{
                uuid: 'this-is-uuid',
                info: '1920 x 1080 - 976.56 KB',
                type: 'image/jpeg',
                displayName: 'cake',
                path: 'placeholder.jpg',
                thumbnail: 'http://placeholder.jpg?t=thumbnail2&lastModified=tomorrow'
            }]
        });
    });
});
