import React from 'react';
import {shallow} from '@jahia/test-framework';
import ContentSearchTitle from './ContentSearchTitle';
import {useDispatch} from 'react-redux';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn()
}));

jest.mock('connected-react-router', () => jest.fn(() => {}));

describe('Content search title', () => {
    it('Should render', async () => {
        const dispatch = jest.fn();
        useDispatch.mockImplementation(() => dispatch);

        const contentTitle = shallow(<ContentSearchTitle onClickBack={() => {}}/>);
        expect(contentTitle.contains('translated_jcontent:label.contentManager.title.search')).toBeTruthy();
    });
});
