import React from 'react';
import {shallow} from '@jahia/test-framework';
import SearchDialog from './SearchDialog';

describe('SearchDialog', () => {
    it('Should render', async () => {
        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchTerms=""
                                              searchContentType=""
                                              searchPath="/sites/test/home"
                                              toggleAdvancedSearch={() => {}}
                                              performSearch={() => {}}
                                              handleSearchChanges={() => {}}
                                              handleClose={() => {}}/>);

        const dialogTitle = wrapper.find('Typography');
        expect(dialogTitle).toHaveLength(1);
    });

    it('Should trigger performSearch', async () => {
        let hasPerformSearch = false;
        const performSearch = () => {
            hasPerformSearch = true;
        };

        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchTerms=""
                                              searchContentType=""
                                              searchPath="/sites/test/home"
                                              toggleAdvancedSearch={() => {}}
                                              performSearch={performSearch}
                                              handleSearchChanges={() => {}}
                                              handleClose={() => {}}/>);

        const buttons = wrapper.find('Button');
        expect(buttons).toHaveLength(3);
        buttons.at(2).prop('onClick')();
        expect(hasPerformSearch).toBeTruthy();
    });

    it('Should trigger handleClose', async () => {
        let hasHandleClose = false;
        const handleClose = () => {
            hasHandleClose = true;
        };

        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchTerms=""
                                              searchContentType=""
                                              searchPath="/sites/test/home"
                                              toggleAdvancedSearch={() => {}}
                                              performSearch={() => {}}
                                              handleSearchChanges={() => {}}
                                              handleClose={handleClose}/>);

        const buttons = wrapper.find('Button');
        expect(buttons).toHaveLength(3);
        buttons.at(1).prop('onClick')();
        expect(hasHandleClose).toBeTruthy();
    });

    it('Should trigger toggleAdvancedSearch', async () => {
        let hasToggleAdvancedSearch = false;
        const toggleAdvancedSearch = () => {
            hasToggleAdvancedSearch = true;
        };

        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchTerms=""
                                              searchContentType=""
                                              searchPath="/sites/test/home"
                                              toggleAdvancedSearch={toggleAdvancedSearch}
                                              performSearch={() => {}}
                                              handleSearchChanges={() => {}}
                                              handleClose={() => {}}/>);

        const buttons = wrapper.find('Button');
        expect(buttons).toHaveLength(3);
        buttons.at(0).prop('onClick')();
        expect(hasToggleAdvancedSearch).toBeTruthy();
    });
});
