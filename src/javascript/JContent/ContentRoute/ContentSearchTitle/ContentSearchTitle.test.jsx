import React from 'react';
import {shallow} from '@jahia/test-framework';
import ContentSearchTitle from './ContentSearchTitle';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn()
}));

jest.mock('connected-react-router', () => jest.fn(() => {}));

describe('Content search title', () => {
    it('Should render', async () => {
        const contentTitle = shallow(<ContentSearchTitle onClickBack={() => {}}/>);
        expect(contentTitle.contains('translated_jcontent:label.contentManager.title.search')).toBeTruthy();
    });
});
