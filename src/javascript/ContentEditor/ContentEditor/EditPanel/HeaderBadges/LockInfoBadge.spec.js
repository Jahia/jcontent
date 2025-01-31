import {LockInfoChip, getBadgeContent} from './LockInfoChip';
import React from 'react';
import {shallow} from '@jahia/test-framework';
import {useTranslation} from 'react-i18next';

jest.mock('~/ContentEditor/contexts/ContentEditor/ContentEditor.context', () => {
    let lockedAndCannotBeEdited = false;
    return {
        useContentEditorContext: () => {
            lockedAndCannotBeEdited = !lockedAndCannotBeEdited;
            return {
                nodeData: {
                    lockedAndCannotBeEdited: lockedAndCannotBeEdited,
                    lockInfo: {
                        details: [{
                            type: 'user',
                            owner: 'root'
                        }]
                    }
                }
            };
        }
    };
});

describe('LockInfoBadge.badge', () => {
    it('Should display badge when lockedAndCannotBeEdited is true', () => {
        let wrapper = shallow(<LockInfoChip/>);
        expect(wrapper.debug()).toContain('Chip');
    });

    it('Should not display badge when lockedAndCannotBeEdited is false', () => {
        let wrapper = shallow(<LockInfoChip/>);
        expect(wrapper.debug()).not.toContain('Chip');
    });
});

describe('Lock Utils', () => {
    it('test getBadgeContent', () => {
        const {t} = useTranslation('jcontent');
        const nodeDataLockUser = {
            input: {
                lockedAndCannotBeEdited: true,
                lockInfo: {
                    details: [{
                        type: 'user',
                        owner: 'root'
                    }]
                }
            },
            expected: {label: 'translated_jcontent:label.contentEditor.edit.action.lock.user', color: 'default'}
        };

        const nodeDataLockWithWorkFlowLock = {
            input: {
                lockedAndCannotBeEdited: true,
                lockInfo: {
                    details: [{
                        type: 'user',
                        owner: 'root'
                    }, {
                        type: 'validation',
                        owner: 'root'
                    }]
                }
            },
            expected: {label: 'translated_jcontent:label.contentEditor.edit.action.lock.validation', color: 'default'}
        };

        const nodeDataUnknownLock = {
            input: {
                lockedAndCannotBeEdited: true,
                lockInfo: {
                    details: [{
                        type: 'customLock',
                        owner: 'root'
                    }]
                }
            },
            expected: {label: 'translated_jcontent:label.contentEditor.edit.action.lock.unknown', color: 'default'}
        };

        const nodeDataDeletion = {
            input: {
                lockedAndCannotBeEdited: true,
                lockInfo: {
                    details: [{
                        type: 'deletion',
                        owner: 'root'
                    }]
                }
            },
            expected: {label: 'translated_jcontent:label.contentEditor.edit.action.lock.deletion', color: 'danger'}
        };

        [nodeDataLockUser, nodeDataLockWithWorkFlowLock, nodeDataUnknownLock, nodeDataDeletion].forEach(
            test => {
                expect(getBadgeContent(test.input, t)).toEqual(test.expected);
            }
        );
    });
});
