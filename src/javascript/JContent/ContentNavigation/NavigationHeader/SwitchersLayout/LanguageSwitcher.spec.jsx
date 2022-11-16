import React from 'react';
import {shallow} from '@jahia/test-framework';
import {useDispatch, useSelector} from 'react-redux';
import LanguageSwitcher from './LanguageSwitcher';
import {useSiteInfo} from '@jahia/data-helper';

jest.mock('react-redux', () => ({
    shallowEqual: jest.fn(),
    useDispatch: jest.fn(),
    useSelector: jest.fn()
}));

jest.mock('~/JContent/redux/JContent.redux', () => ({
    cmGoto: jest.fn()
}));

jest.mock('@jahia/data-helper', () => ({
    useSiteInfo: jest.fn()
}));

describe('Language switcher test', () => {
    let siteInfo;

    beforeEach(() => {
        siteInfo = {
            languages: [
                {language: 'en', activeInEdit: true}
            ]
        };
        useSelector.mockImplementation(() => ({
            siteKey: 'test',
            lang: 'en'
        }));
        useDispatch.mockImplementation(jest.fn());
    });

    it('should NOT show language switcher in left nav with one language', () => {
        useSiteInfo.mockReturnValue({siteInfo});

        const cmp = shallow(<LanguageSwitcher/>);
        expect(cmp.find('Dropdown').exists()).toBeFalsy();
    });

    it('should show language switcher in left nav with more than one language', () => {
        siteInfo.languages.push({language: 'fr-ca', activeInEdit: true});
        useSiteInfo.mockReturnValue({siteInfo});

        const cmp = shallow(<LanguageSwitcher/>);
        expect(cmp.find('Dropdown').exists()).toBeTruthy();
    });

    it('should NOT show language switcher in left nav with only one ACTIVE language', () => {
        siteInfo.languages.push({language: 'fr-ca', activeInEdit: false});
        useSiteInfo.mockReturnValue({siteInfo});

        const cmp = shallow(<LanguageSwitcher/>);
        expect(cmp.find('Dropdown').exists()).toBeFalsy();
    });
});
