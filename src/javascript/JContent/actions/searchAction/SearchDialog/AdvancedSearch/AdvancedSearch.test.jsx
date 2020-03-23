import React from 'react';
import {shallow} from '@jahia/test-framework';
import AdvancedSearch from './AdvancedSearch';

global.contextJsParameters = {config: {links: {}}};

const searchPath = '/sites/test/home/about';
const sql2SearchFrom = '';
const sql2SearchWhere = '';
const searchForm = {
    searchPath,
    sql2SearchFrom,
    sql2SearchWhere
};
const searchFormSetters = {
    setSearchPath: () => {
    },
    setSql2SearchFrom: () => {
    },
    setSql2SearchWhere: () => {
    }
};

describe('AdvancedSearch', () => {
    it('Should Render', async () => {
        const wrapper = shallow(<AdvancedSearch searchForm={searchForm}
                                                searchFormSetters={searchFormSetters}
                                                performSearch={() => {
                                                }}/>);

        const dropdown = wrapper.find('Input');
        expect(dropdown).toHaveLength(2);
    });

    it('Input should trigger the search when pressing enter key', async () => {
        let hasPerformSearch = false;
        const performSearch = () => {
            hasPerformSearch = true;
        };

        const wrapper = shallow(<AdvancedSearch searchForm={searchForm}
                                                searchFormSetters={searchFormSetters}
                                                performSearch={performSearch}/>);

        const input = wrapper.find('Input').at(0);
        input.prop('onKeyPress')({keyCode: 13});
        expect(hasPerformSearch).toBeTruthy();
    });

    it('Input should return search terms', async () => {
        const newSearchTerms = 'Hello';

        let hasHandledSearchChanges = false;
        const setSql2SearchFrom = value => {
            hasHandledSearchChanges = true;
            expect(value).toBe(newSearchTerms);
        };

        const wrapper = shallow(<AdvancedSearch searchForm={searchForm}
                                                searchFormSetters={{...searchFormSetters, setSql2SearchFrom}}
                                                performSearch={() => {
                                                }}/>);

        const input = wrapper.find('Input').at(0);
        input.prop('onChange')({target: {value: newSearchTerms}});
        expect(hasHandledSearchChanges).toBeTruthy();
    });
});
