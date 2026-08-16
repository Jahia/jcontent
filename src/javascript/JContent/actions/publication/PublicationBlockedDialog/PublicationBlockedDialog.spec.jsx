import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {t} from 'react-i18next';
import {PublicationBlockedDialog} from './PublicationBlockedDialog';
import {getPairKey} from '../getMissingMandatoryProperties';

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
        t.mockClear();
        window.CE_API = {edit: jest.fn()};
        defaultProps = {
            blockedPairs: [
                {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'en', publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE', allowedToPublishWithoutWorkflow: true},
                {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'es', publicationStatus: 'MANDATORY_LANGUAGE_UNPUBLISHABLE', allowedToPublishWithoutWorkflow: true},
                {uuid: 'uuid-2', path: '/sites/mySite/news', displayName: 'News', language: 'fr', publicationStatus: 'CONFLICT', allowedToPublishWithoutWorkflow: true}
            ],
            heldBackPairs: [],
            pairsToPublish: [
                {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'fr', publicationStatus: 'MODIFIED', allowedToPublishWithoutWorkflow: true},
                {uuid: 'uuid-2', path: '/sites/mySite/news', displayName: 'News', language: 'de', publicationStatus: 'NOT_PUBLISHED', allowedToPublishWithoutWorkflow: true}
            ],
            missingPropertiesByPair: {
                [getPairKey('uuid-1', 'en')]: [{name: 'jcr:title', displayName: 'Title'}, {name: 'body', displayName: 'Body'}],
                [getPairKey('uuid-1', 'es')]: []
            },
            siteLanguages: [
                {language: 'en', displayName: 'English', mandatory: true, activeInEdit: true},
                {language: 'fr', displayName: 'Français', mandatory: false, activeInEdit: true},
                {language: 'es', displayName: 'Español', mandatory: false, activeInEdit: true},
                {language: 'de', displayName: 'Deutsch', mandatory: false, activeInEdit: true}
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

    it('should group the unpublishable items by language, ordered like the site languages', () => {
        const cmp = shallowDialog(defaultProps);

        expect(cmp.find({'data-sel-role': 'blocked-language-en'})).toHaveLength(1);
        expect(cmp.find({'data-sel-role': 'blocked-language-es'})).toHaveLength(1);
        expect(cmp.find({'data-sel-role': 'blocked-language-fr'})).toHaveLength(0);

        const sections = cmp.find('section').map(section => section.props()['data-sel-role']);
        expect(sections.indexOf('blocked-language-en')).toBeLessThan(sections.indexOf('blocked-language-es'));
    });

    it('should flag the site-mandatory languages with a chip', () => {
        const cmp = shallowDialog(defaultProps);

        const englishSection = cmp.find({'data-sel-role': 'blocked-language-en'});
        const spanishSection = cmp.find({'data-sel-role': 'blocked-language-es'});
        expect(englishSection.find({'data-sel-role': 'mandatory-language-chip'})).toHaveLength(1);
        expect(spanishSection.find({'data-sel-role': 'mandatory-language-chip'})).toHaveLength(0);
    });

    it('should list the missing mandatory properties as chips labeled with their display name', () => {
        const cmp = shallowDialog(defaultProps);

        const chips = cmp.find({'data-sel-role': 'blocked-language-en'}).find({'data-sel-role': 'missing-property'});
        expect(chips).toHaveLength(2);
        expect(chips.at(0).props().label).toBe('Title');
        expect(chips.at(1).props().label).toBe('Body');
    });

    it('should show the generic sub-items note when the blocked node itself has no missing property', () => {
        const cmp = shallowDialog(defaultProps);

        const spanishSection = cmp.find({'data-sel-role': 'blocked-language-es'});
        expect(spanishSection.find({'data-sel-role': 'missing-property'})).toHaveLength(0);
        expect(spanishSection.find({'data-sel-role': 'descendants-incomplete-note'})).toHaveLength(1);
    });

    it('should show neither chips nor note when the property details are unavailable', () => {
        defaultProps.missingPropertiesByPair = null;
        const cmp = shallowDialog(defaultProps);

        expect(cmp.find({'data-sel-role': 'missing-property'})).toHaveLength(0);
        expect(cmp.find({'data-sel-role': 'descendants-incomplete-note'})).toHaveLength(0);
    });

    it('should list the conflicts in their own section without property detail', () => {
        const cmp = shallowDialog(defaultProps);

        const conflictSection = cmp.find({'data-sel-role': 'blocked-conflicts'});
        expect(conflictSection).toHaveLength(1);
        expect(conflictSection.find({'data-sel-role': 'blocked-item'})).toHaveLength(1);
        expect(conflictSection.find({'data-sel-role': 'missing-property'})).toHaveLength(0);
    });

    it('should show the held-back section naming the incomplete mandatory languages', () => {
        defaultProps.heldBackPairs = [
            {uuid: 'uuid-1', path: '/sites/mySite/home', displayName: 'Home', language: 'de', publicationStatus: 'MANDATORY_LANGUAGE_VALID', allowedToPublishWithoutWorkflow: true}
        ];
        const cmp = shallowDialog(defaultProps);

        const heldBackSection = cmp.find({'data-sel-role': 'held-back-languages'});
        expect(heldBackSection).toHaveLength(1);
        expect(heldBackSection.find({'data-sel-role': 'held-back-item'})).toHaveLength(1);
        // English is the mandatory site language and it is blocked: the description must name it
        expect(t).toHaveBeenCalledWith(
            'jcontent:label.contentManager.publicationBlockedDialog.heldBackDescription',
            {languages: 'English'}
        );
    });

    it('should hide the held-back section when no pair is held back', () => {
        const cmp = shallowDialog(defaultProps);

        expect(cmp.find({'data-sel-role': 'held-back-languages'})).toHaveLength(0);
    });

    it('should open Content Editor on the node in the blocked language', () => {
        const cmp = shallowDialog(defaultProps);

        cmp.find({'data-sel-role': 'blocked-language-en'}).find({'data-sel-role': 'edit-in-language'}).simulate('click');

        expect(window.CE_API.edit).toHaveBeenCalledWith({uuid: 'uuid-1', lang: 'en', isFullscreen: false});
    });

    it('should show an enabled Publish button when pairs remain publishable', () => {
        const cmp = shallowDialog(defaultProps);

        const continueButton = cmp.find({'data-sel-role': 'continue-button'});
        expect(continueButton.props().isDisabled).toBe(false);
        expect(continueButton.props().label).toBe('translated_jcontent:label.contentManager.publicationBlockedDialog.publish');
        expect(cmp.find({'data-sel-role': 'cancel-button'})).toHaveLength(1);
        expect(cmp.find({'data-sel-role': 'nothing-to-publish'})).toHaveLength(0);
    });

    it('should list the pairs that will actually be published in their own section', () => {
        const cmp = shallowDialog(defaultProps);

        const toPublishSection = cmp.find({'data-sel-role': 'languages-to-publish'});
        expect(toPublishSection).toHaveLength(1);
        const items = toPublishSection.find({'data-sel-role': 'to-publish-item'});
        expect(items).toHaveLength(2);
        expect(items.at(0).text()).toContain('Home');
        expect(items.at(0).text()).toContain('/sites/mySite/home');
        expect(items.at(1).text()).toContain('News');
        expect(items.at(1).text()).toContain('/sites/mySite/news');
    });

    it('should disable the Publish button with an explanation and no to-publish section when nothing remains publishable', () => {
        defaultProps.pairsToPublish = [];
        const cmp = shallowDialog(defaultProps);

        const continueButton = cmp.find({'data-sel-role': 'continue-button'});
        expect(continueButton.props().isDisabled).toBe(true);
        expect(continueButton.props().label).toBe('translated_jcontent:label.contentManager.publicationBlockedDialog.publish');
        expect(cmp.find({'data-sel-role': 'nothing-to-publish'})).toHaveLength(1);
        expect(cmp.find({'data-sel-role': 'languages-to-publish'})).toHaveLength(0);
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
        expect(mutation.loc.source.body).toContain('mutateNode(pathOrId: "uuid-2")');
        expect(mutation.loc.source.body).toContain('publish(languages: ["de"]');
    });

    it('should not publish anything on cancel', () => {
        const cmp = shallowDialog(defaultProps);

        cmp.find({'data-sel-role': 'cancel-button'}).simulate('click');

        expect(mockMutate).not.toHaveBeenCalled();
    });
});
