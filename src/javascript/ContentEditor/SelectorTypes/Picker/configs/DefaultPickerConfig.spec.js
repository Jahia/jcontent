import {DefaultPickerConfig} from './DefaultPickerConfig';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {useQuery} from '@apollo/client';

jest.mock('@apollo/client', () => {
    return {useQuery: jest.fn()};
});

jest.mock('../Picker', () => {
    return {
        Picker: () => {}
    };
});

jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context');

describe('ContentPicker config', () => {
    describe('usePickerInputData', () => {
        let contentEditorContext;
        beforeEach(() => {
            contentEditorContext = {
                lang: 'fr'
            };
            useContentEditorContext.mockReturnValue(contentEditorContext);
        });

        const usePickerInputData = DefaultPickerConfig.pickerInput.usePickerInputData;

        it('should return no data, no error when loading', () => {
            useQuery.mockImplementation(() => ({loading: true}));
            expect(usePickerInputData('uuid', {lang: 'fr'})).toEqual({loading: true, notFound: true});
        });

        it('should return no data when there is no uuid given', () => {
            useQuery.mockImplementation(() => ({loading: false, data: {}}));
            expect(usePickerInputData('', {lang: 'fr'})).toEqual({loading: false, notFound: false});
        });

        it('should return error when there is error', () => {
            useQuery.mockImplementation(() => ({loading: false, error: 'oops'}));
            expect(usePickerInputData('uuid', {lang: 'fr'})).toEqual({loading: false, error: 'oops', notFound: true});
        });

        it('should return not found when the resource has been removed', () => {
            useQuery.mockImplementation(() => ({loading: false, data: undefined, error: undefined}));
            expect(usePickerInputData('uuid', {lang: 'fr'})).toEqual({loading: false, notFound: true});
        });

        it('should adapt data when graphql return some data', () => {
            useQuery.mockImplementation(() => ({
                loading: false,
                data: {
                    jcr: {
                        result: [{
                            uuid: 'this-is-uuid',
                            displayName: 'a cake',
                            path: 'florent/bestArticles',
                            primaryNodeType: {
                                displayName: 'article',
                                icon: 'anUrl'
                            }
                        }]
                    }
                }
            }));

            expect(usePickerInputData('this-is-uuid', {lang: 'fr'})).toEqual({
                loading: false,
                error: undefined,
                fieldData: [{
                    uuid: 'this-is-uuid',
                    info: 'article',
                    name: 'a cake',
                    path: 'florent/bestArticles',
                    url: 'anUrl.png'
                }]
            });
        });
    });
});
