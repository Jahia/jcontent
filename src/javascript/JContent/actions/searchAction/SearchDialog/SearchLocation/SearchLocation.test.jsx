import React from 'react';
import {mount} from '@jahia/test-framework';
import SearchLocation from './SearchLocation';

const searchPath = '/sites/test/home/about';
const nodePath = '/sites/test/home/about';
const nodeDisplayName = 'About test';
const siteInfo = {
    path: '/sites/test',
    displayName: 'Test site'
};

describe('SearchLocation', () => {
    it('Should Render', async () => {
        const wrapper = mount(<SearchLocation searchPath={searchPath}
                                              nodePath={nodePath}
                                              nodeDisplayName={nodeDisplayName}
                                              siteInfo={siteInfo}
                                              handleSearchChanges={() => {}}/>);

        const formControlLabels = wrapper.find('FormControlLabel');
        expect(formControlLabels).toHaveLength(2);

        formControlLabels.forEach(node => {
            expect(node.props().value === siteInfo.path || node.props().value === nodePath).toBeTruthy();
        });
    });

    it('Should have current node as default path', async () => {
        const wrapper = mount(<SearchLocation searchPath={searchPath}
                                              nodePath={nodePath}
                                              nodeDisplayName={nodeDisplayName}
                                              siteInfo={siteInfo}
                                              handleSearchChanges={() => {}}/>);

        const formControlLabels = wrapper.find('FormControlLabel');
        formControlLabels.forEach(node => {
            if (node.props().value === nodePath) {
                expect(node.props().checked).toBeTruthy();
            }
        });
    });

    it('Should have current site as default path', async () => {
        const newSearchPath = siteInfo.path;
        const wrapper = mount(<SearchLocation searchPath={newSearchPath}
                                              nodePath={nodePath}
                                              nodeDisplayName={nodeDisplayName}
                                              siteInfo={siteInfo}
                                              handleSearchChanges={() => {}}/>);

        const formControlLabels = wrapper.find('FormControlLabel');
        formControlLabels.forEach(node => {
            if (node.props().value === siteInfo.path) {
                expect(node.props().checked).toBeTruthy();
            }
        });
    });

    it('Should return selected path', async () => {
        let hasHandledSearchChanges = false;
        const handleSearchChanges = (key, value) => {
            hasHandledSearchChanges = true;
            expect(value).toBe(siteInfo.path);
        };

        const wrapper = mount(<SearchLocation searchPath={searchPath}
                                              nodePath={nodePath}
                                              nodeDisplayName={nodeDisplayName}
                                              siteInfo={siteInfo}
                                              handleSearchChanges={handleSearchChanges}/>);

        const formControlLabels = wrapper.find('FormControlLabel');
        if (!formControlLabels.at(0).props().checked) {
            const value = formControlLabels.at(0).props().value;
            formControlLabels.at(0).prop('onChange')({target: {value}});
        }

        expect(hasHandledSearchChanges).toBeTruthy();
    });
});
