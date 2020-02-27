import React from 'react';
import {shallow} from '@jahia/test-framework';
import {Cloud, Delete, File, Lock, NoCloud, Warning} from '@jahia/moonstone/dist/icons';

import Status from './Status';

describe('Status', () => {
    it('should be \'Locked\'', () => {
        const wrapper = shallow(<Status type="locked"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.locked');
        expect(wrapper.props().color).toBe('warning');
        expect(wrapper.props().icon).toStrictEqual(<Lock/>);
    });

    it('should a \'Marked for deletion\'', () => {
        const wrapper = shallow(<Status type="markedForDeletion"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.markedForDeletion');
        expect(wrapper.props().color).toBe('danger');
        expect(wrapper.props().icon).toStrictEqual(<Delete/>);
    });

    it('should be \'Modified\'', () => {
        const wrapper = shallow(<Status type="modified"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.modified');
        expect(wrapper.props().color).toBe('default');
        expect(wrapper.props().icon).toStrictEqual(<File/>);
    });

    it('should be \'New\'', () => {
        const wrapper = shallow(<Status type="new"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.new');
        expect(wrapper.props().color).toBe('success');
        expect(wrapper.props().icon).toStrictEqual(<File/>);
    });

    it('should be \'Not published\'', () => {
        const wrapper = shallow(<Status type="notPublished"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.notPublished');
        expect(wrapper.props().color).toBe('warning');
        expect(wrapper.props().icon).toStrictEqual(<NoCloud/>);
    });

    it('should be \'Published\'', () => {
        const wrapper = shallow(<Status type="published"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.published');
        expect(wrapper.props().color).toBe('accent');
        expect(wrapper.props().icon).toStrictEqual(<Cloud/>);
    });

    it('should be \'Warning\'', () => {
        const wrapper = shallow(<Status type="warning"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.warning');
        expect(wrapper.props().color).toBe('warning');
        expect(wrapper.props().icon).toStrictEqual(<Warning/>);
    });

    it('should be \'Work in progress\'', () => {
        const wrapper = shallow(<Status type="workInProgress"/>);

        expect(wrapper.find('Chip').exists()).toBeTruthy();
        expect(wrapper.props().label).toBe('translated_label.contentManager.contentStatus.workInProgress');
        expect(wrapper.props().color).toBe('default');
        expect(wrapper.props().icon).toStrictEqual(<File/>);
    });
});
