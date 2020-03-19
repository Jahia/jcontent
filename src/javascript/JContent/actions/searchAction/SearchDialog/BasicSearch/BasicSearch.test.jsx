import React from 'react';
import {shallow} from '@jahia/test-framework';
import BasicSearch from './BasicSearch';
import {extractAndFormatContentTypeData} from './BasicSearch.utils';
import {ImgWrapper} from '@jahia/moonstone';

const searchPath = '/sites/test/home/about';
const searchTerms = '';
const searchContentType = '';
const contentTypeData = [
    {
        label: 'Content type 1',
        value: 'test:content1',
        iconStart: <ImgWrapper src="/icon1.png"/>
    },
    {
        label: 'Content type 2',
        value: 'test:content2',
        iconStart: <ImgWrapper src="/icon2.png"/>
    }
];

describe('BasicSearch', () => {
    it('Should Render', async () => {
        const wrapper = shallow(<BasicSearch searchPath={searchPath}
                                             searchTerms={searchTerms}
                                             searchContentType={searchContentType}
                                             contentTypeData={contentTypeData}
                                             handleSearchChanges={() => {}}
                                             performSearch={() => {}}/>);

        const dropdown = wrapper.find('Dropdown');
        expect(dropdown).toHaveLength(1);
    });

    it('Dropdown should have any content as default value', async () => {
        const wrapper = shallow(<BasicSearch searchPath={searchPath}
                                             searchTerms={searchTerms}
                                             searchContentType={searchContentType}
                                             contentTypeData={contentTypeData}
                                             handleSearchChanges={() => {}}
                                             performSearch={() => {}}/>);

        const dropdown = wrapper.find('Dropdown').at(0);
        expect(dropdown.props().label).toBe('translated_label.contentManager.search.anyContent');
        expect(dropdown.props().value).toBe('');
    });

    it('Dropdown should have Content type 2 as default value', async () => {
        const wrapper = shallow(<BasicSearch searchPath={searchPath}
                                             searchTerms={searchTerms}
                                             searchContentType={contentTypeData[1].value}
                                             contentTypeData={contentTypeData}
                                             handleSearchChanges={() => {}}
                                             performSearch={() => {}}/>);

        const dropdown = wrapper.find('Dropdown').at(0);
        expect(dropdown.props().label).toBe(contentTypeData[1].label);
        expect(dropdown.props().value).toBe(contentTypeData[1].value);
    });

    it('Input should trigger the search when pressing enter key', async () => {
        let hasPerformSearch = false;
        const performSearch = () => {
            hasPerformSearch = true;
        };

        const wrapper = shallow(<BasicSearch searchPath={searchPath}
                                             searchTerms={searchTerms}
                                             searchContentType={searchContentType}
                                             contentTypeData={contentTypeData}
                                             handleSearchChanges={() => {}}
                                             performSearch={performSearch}/>);

        const input = wrapper.find('Input').at(0);
        input.prop('onKeyPress')({keyCode: 13});
        expect(hasPerformSearch).toBeTruthy();
    });

    it('Input should return search terms', async () => {
        const newSearchTerms = 'Hello';

        let hasHandledSearchChanges = false;
        const handleSearchChanges = (key, value) => {
            hasHandledSearchChanges = true;
            expect(value).toBe(newSearchTerms);
        };

        const wrapper = shallow(<BasicSearch searchPath={searchPath}
                                             searchTerms={searchTerms}
                                             searchContentType={searchContentType}
                                             contentTypeData={contentTypeData}
                                             handleSearchChanges={handleSearchChanges}
                                             performSearch={() => {}}/>);

        const input = wrapper.find('Input').at(0);
        input.prop('onChange')({target: {value: newSearchTerms}});
        expect(hasHandledSearchChanges).toBeTruthy();
    });

    it('Dropdown should return selected content type', async () => {
        let hasHandledSearchChanges = false;
        const handleSearchChanges = (key, value) => {
            hasHandledSearchChanges = true;
            expect(value).toBe(contentTypeData[1].value);
        };

        const wrapper = shallow(<BasicSearch searchPath={searchPath}
                                             searchTerms={searchTerms}
                                             searchContentType={searchContentType}
                                             contentTypeData={contentTypeData}
                                             handleSearchChanges={handleSearchChanges}
                                             performSearch={() => {}}/>);

        const dropdown = wrapper.find('Dropdown').at(0);
        dropdown.prop('onChange')({}, contentTypeData[1]);
        expect(hasHandledSearchChanges).toBeTruthy();
    });

    it('extractAndFormatContentTypeData should return a valid set of data', async () => {
        const data = {
            jcr: {
                nodeTypes: {
                    nodes: [
                        {
                            displayName: 'Content type 1',
                            name: 'test:content1',
                            icon: '/icon1'
                        },
                        {
                            displayName: 'Content type 2',
                            name: 'test:content2',
                            icon: '/icon2'
                        }
                    ]
                }
            }
        };

        const formattedData = extractAndFormatContentTypeData(data);
        expect(formattedData).toEqual(contentTypeData);
    });
});
