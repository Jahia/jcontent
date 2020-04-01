import React from 'react';
import {shallow} from '@jahia/test-framework';
import SearchDialog from './SearchDialog';
import {FormControlLabel} from '@material-ui/core';

describe('SearchDialog', () => {
    it('Should render', async () => {
        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchForm={{}}
                                              searchFormSetters={{}}
                                              toggleAdvancedSearch={() => {}}
                                              performSearch={() => {}}
                                              handleClose={() => {}}/>);

        const dialogTitle = wrapper.find('Typography');
        expect(dialogTitle).toHaveLength(2);
    });

    it('Should trigger performSearch', async () => {
        let hasPerformSearch = false;
        const performSearch = () => {
            hasPerformSearch = true;
        };

        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchForm={{}}
                                              searchFormSetters={{}}
                                              toggleAdvancedSearch={() => {}}
                                              performSearch={performSearch}
                                              handleClose={() => {}}/>);

        const buttons = wrapper.find('Button');
        expect(buttons).toHaveLength(2);
        buttons.at(1).prop('onClick')();
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
        expect(buttons).toHaveLength(2);
        buttons.at(0).prop('onClick')();
        expect(hasHandleClose).toBeTruthy();
    });

    it('Should trigger toggleAdvancedSearch', async () => {
        let hasToggleAdvancedSearch = false;
        const toggleAdvancedSearch = () => {
            hasToggleAdvancedSearch = true;
        };

        const wrapper = shallow(<SearchDialog isOpen
                                              isAdvancedSearch={false}
                                              searchForm={{}}
                                              searchFormSetters={{}}
                                              toggleAdvancedSearch={toggleAdvancedSearch}
                                              performSearch={() => {}}
                                              handleClose={() => {}}/>);

        const controlLabel = wrapper.find(FormControlLabel);
        expect(controlLabel).toHaveLength(1);
        controlLabel.prop('control').props.onChange();
        expect(hasToggleAdvancedSearch).toBeTruthy();
    });
});
