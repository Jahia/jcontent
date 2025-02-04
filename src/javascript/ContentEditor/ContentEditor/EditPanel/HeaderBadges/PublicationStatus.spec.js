import PublicationStatus from '../../../../JContent/ContentRoute/ContentStatuses/Status';
import React from 'react';
import {shallow} from '@jahia/test-framework';
import {CloudCheck, Modified, FileContent, NoCloud, Warning} from '@jahia/moonstone';

describe('PublicationStatus', () => {
    it('Should display not published chip', () => {
        let wrapper = shallow(<PublicationStatus type="notPublished"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.notPublished');
        expect(wrapper.props().color).toBe('default');
        expect(wrapper.props().icon).toStrictEqual(<NoCloud/>);
    });

    it('Should display modified chip', () => {
        let wrapper = shallow(<PublicationStatus type="modified"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.modified');
        expect(wrapper.props().color).toBe('warning');
        expect(wrapper.props().icon).toStrictEqual(<Modified/>);
    });

    it('Should display published chip', () => {
        let wrapper = shallow(<PublicationStatus type="published"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.published');
        expect(wrapper.props().color).toBe('success');
        expect(wrapper.props().icon).toStrictEqual(<CloudCheck/>);
    });

    it('Should display warning chip', () => {
        let wrapper = shallow(<PublicationStatus type="warning"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.warning');
        expect(wrapper.props().color).toBe('warning');
        expect(wrapper.props().icon).toStrictEqual(<Warning/>);
    });

    it('Should display publishing chip', () => {
        let wrapper = shallow(<PublicationStatus type="publishing"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.publishing');
        expect(wrapper.props().color).toBe('accent');
        expect(wrapper.props().icon).toStrictEqual(<FileContent/>);
    });
});
