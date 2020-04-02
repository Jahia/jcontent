import React from 'react';
import {shallow} from '@jahia/test-framework';

import ContentStatuses from './ContentStatuses';
import Status from './Status';

describe('ContentStatuses', () => {
    const defaultProps = {
        language: 'en',
        uilang: 'en'
    };

    it('should only render a \'Not Published\' status', () => {
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={{}}/>);

        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(1);
    });

    it('should render a \'Not Published\' status when unpublished', () => {
        const node = {
            aggregatedPublicationInfo: {
                publicationStatus: 'UNPUBLISHED'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);

        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(1);
    });

    it('should only render a \'Published\' status when published', () => {
        const node = {
            aggregatedPublicationInfo: {
                publicationStatus: 'PUBLISHED'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.publicationStatus.published';

        expect(wrapper.containsMatchingElement(<Status type="published" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(1);
    });

    it('should render a \'Locked\' status when locked', () => {
        const node = {
            lockOwner: {
                value: 'me'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.lockedBy';

        expect(wrapper.containsMatchingElement(<Status type="locked" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should render a \'Marked for deletion\' status when deleted', () => {
        const node = {
            mixinTypes: [{
                name: 'jmix:markedForDeletion'
            }]
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.publicationStatus.markedForDeletion';

        expect(wrapper.containsMatchingElement(<Status type="markedForDeletion" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should render a \'Modified\' status when modified', () => {
        const node = {
            aggregatedPublicationInfo: {
                publicationStatus: 'MODIFIED'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.publicationStatus.modified';

        expect(wrapper.containsMatchingElement(<Status type="modified" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="published"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should render a \'Warning\' status', () => {
        const node = {
            aggregatedPublicationInfo: {
                publicationStatus: 'anything else'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.publicationStatus.unknown';

        expect(wrapper.containsMatchingElement(<Status type="warning" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should render a \'Work in progress\' status when is work in progress in all languages', () => {
        const node = {
            wipStatus: {value: 'ALL_CONTENT'}
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.workInProgressAll';

        expect(wrapper.containsMatchingElement(<Status type="workInProgress" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should render a \'Work in progress\' status when is work in progress in current language', () => {
        const node = {
            wipStatus: {value: 'LANGUAGES'},
            wipLangs: {values: ['fr']}
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node} language="fr"/>);
        const expectedTooltip = 'translated_label.contentManager.workInProgress';

        expect(wrapper.containsMatchingElement(<Status type="workInProgress" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should not render a \'Work in progress\' status when is work in progress in another language', () => {
        const node = {
            wipStatus: {value: 'LANGUAGES'},
            wipLangs: {values: ['fr', 'gr']}
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);

        expect(wrapper.containsMatchingElement(<Status type="workInProgress"/>)).toBeFalsy();
    });
});
