import React from 'react';
import {shallow} from '@jahia/test-framework';
import ContentTitle from './ContentTitle';

describe('Content title', () => {
    it('Should render', async () => {
        const title = 'Hello Content Title!';
        const contentTitle = shallow(<ContentTitle title={title}/>);
        expect(contentTitle.contains(title)).toBeTruthy();
    });
});
