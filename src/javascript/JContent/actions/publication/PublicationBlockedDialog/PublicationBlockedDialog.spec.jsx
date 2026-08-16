import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {PublicationBlockedDialog} from './PublicationBlockedDialog';

const mockMutate = jest.fn(() => Promise.resolve());

jest.mock('@apollo/client', () => ({
    useApolloClient: () => ({
        mutate: mockMutate
    })
}));

jest.mock('notistack', () => ({
    enqueueSnackbar: jest.fn()
}));

jest.mock('~/JContent/JContent.refetches', () => ({
    triggerRefetchAll: jest.fn()
}));

describe('PublicationBlockedDialog', () => {
    let defaultProps;

    beforeEach(() => {
        mockMutate.mockClear();
        defaultProps = {
            blockedPairs: [
                {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'en', publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE', allowedToPublishWithoutWorkflow: true},
                {uuid: 'uuid-2', path: '/sites/mySite/news', displayName: 'News', language: 'fr', publicationStatus: 'CONFLICT', allowedToPublishWithoutWorkflow: true}
            ],
            pairsToPublish: [
                {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'fr', publicationStatus: 'MODIFIED', allowedToPublishWithoutWorkflow: true}
            ],
            isAllSubTree: false,
            onExit: jest.fn()
        };
    });

    const shallowDialog = props => shallowWithTheme(
        <PublicationBlockedDialog {...props}/>,
        {},
        dsGenericTheme
    ).dive();

    it('should be open and expose the e2e dialog role', () => {
        const cmp = shallowDialog(defaultProps);

        expect(cmp.props().open).toBe(true);
        expect(cmp.props()['data-sel-role']).toBe('publication-blocked-dialog');
    });

    it('should list the blocked items grouped by status', () => {
        const cmp = shallowDialog(defaultProps);

        expect(cmp.find({'data-sel-role': 'blocked-group-MANDATORY_LANGUAGE_UNPUBLISHABLE'})).toHaveLength(1);
        expect(cmp.find({'data-sel-role': 'blocked-group-CONFLICT'})).toHaveLength(1);
        expect(cmp.find({'data-sel-role': 'blocked-item'})).toHaveLength(2);
    });

    it('should show the continue question with cancel and continue buttons when partially blocked', () => {
        const cmp = shallowDialog(defaultProps);

        expect(cmp.find({'data-sel-role': 'continue-question'}).exists()).toBe(true);
        expect(cmp.find({'data-sel-role': 'cancel-button'}).exists()).toBe(true);
        expect(cmp.find({'data-sel-role': 'continue-button'}).exists()).toBe(true);
        expect(cmp.find({'data-sel-role': 'close-button'}).exists()).toBe(false);
    });

    it('should show the informational variant with a single close button when nothing remains to publish', () => {
        defaultProps.pairsToPublish = [];
        const cmp = shallowDialog(defaultProps);

        expect(cmp.find({'data-sel-role': 'continue-question'}).exists()).toBe(false);
        expect(cmp.find({'data-sel-role': 'cancel-button'}).exists()).toBe(false);
        expect(cmp.find({'data-sel-role': 'continue-button'}).exists()).toBe(false);
        expect(cmp.find({'data-sel-role': 'close-button'}).exists()).toBe(true);
    });

    it('should publish only the pairs needing publication on continue and close the dialog', async () => {
        defaultProps.isAllSubTree = true;
        const cmp = shallowDialog(defaultProps);

        cmp.find({'data-sel-role': 'continue-button'}).simulate('click');
        await Promise.resolve();

        expect(mockMutate).toHaveBeenCalledTimes(1);
        const {mutation, variables} = mockMutate.mock.calls[0][0];
        expect(variables).toEqual({includeSubTree: true});
        expect(mutation.loc.source.body).toContain('mutateNode(pathOrId: "uuid-1")');
        expect(mutation.loc.source.body).toContain('publish(languages: ["fr"]');
        expect(mutation.loc.source.body).not.toContain('uuid-2');
    });

    it('should not publish anything on cancel', () => {
        const cmp = shallowDialog(defaultProps);

        cmp.find({'data-sel-role': 'cancel-button'}).simulate('click');

        expect(mockMutate).not.toHaveBeenCalled();
    });
});
