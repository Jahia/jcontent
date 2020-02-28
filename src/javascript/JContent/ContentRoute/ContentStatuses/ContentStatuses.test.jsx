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

    it('should only render a \'Published\' status', () => {
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

    it('should render a \'Locked\' status', () => {
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

    it('should render a \'Marked for deletion\' status', () => {
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

    it('should render a \'Modified\' status', () => {
        const node = {
            aggregatedPublicationInfo: {
                publicationStatus: 'MODIFIED'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.publicationStatus.modified';

        expect(wrapper.containsMatchingElement(<Status type="modified" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should render a \'New\' status', () => {
        const node = {
            aggregatedPublicationInfo: {
                publicationStatus: 'NOT_PUBLISHED'
            }
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.publicationStatus.notPublished';

        expect(wrapper.containsMatchingElement(<Status type="new" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
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

    it('should render a \'Work in progress\' status', () => {
        const node = {
            wipStatus: {value: 'ALL_CONTENT'}
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);
        const expectedTooltip = 'translated_label.contentManager.workInProgressAll';

        expect(wrapper.containsMatchingElement(<Status type="workInProgress" tooltip={expectedTooltip}/>)).toBeTruthy();
        expect(wrapper.containsMatchingElement(<Status type="notPublished"/>)).toBeTruthy();
        expect(wrapper.find('Status')).toHaveLength(2);
    });

    it('should also render a \'Work in progress\' status', () => {
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

    it('should not render a \'Work in progress\' status', () => {
        const node = {
            wipStatus: {value: 'LANGUAGES'},
            wipLangs: {values: ['fr', 'gr']}
        };
        const wrapper = shallow(<ContentStatuses {...defaultProps} node={node}/>);

        expect(wrapper.containsMatchingElement(<Status type="workInProgress"/>)).toBeFalsy();
    });
});
