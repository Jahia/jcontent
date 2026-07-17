import React from 'react';
import {shallow} from '@jahia/test-framework';
import {TranslateFieldActionComponent} from './translateFieldAction';
import {useContentEditorConfigContext, useContentEditorContext} from '~/ContentEditor/contexts';

jest.mock('~/ContentEditor/contexts', () => ({
    useContentEditorConfigContext: jest.fn(),
    useContentEditorContext: jest.fn()
}));

// A no-op stand-in for the button renderer; we only assert whether/how the arrow is rendered.
const Render = () => null;

describe('TranslateFieldActionComponent', () => {
    const i18nField = {name: 'nt_prop', i18n: true};
    let setI18nContext;

    const render = (sideBySideContext, props = {}) => {
        useContentEditorConfigContext.mockReturnValue({sideBySideContext});
        useContentEditorContext.mockReturnValue({setI18nContext});
        return shallow(
            <TranslateFieldActionComponent field={i18nField} value="source" render={Render} {...props}/>
        );
    };

    // Whether the restore arrow is rendered at all.
    const hasArrow = wrapper => wrapper.find(Render).exists();

    beforeEach(() => {
        setI18nContext = jest.fn();
    });

    it('renders no arrow when side-by-side is disabled', () => {
        expect(hasArrow(render({enabled: false, translateLang: 'en'}))).toBe(false);
    });

    it('renders no arrow for a non-i18n field', () => {
        useContentEditorConfigContext.mockReturnValue({sideBySideContext: {enabled: true, translateLang: 'en'}});
        useContentEditorContext.mockReturnValue({setI18nContext});
        const wrapper = shallow(
            <TranslateFieldActionComponent field={{name: 'x', i18n: false}} value="source" render={Render}/>
        );
        expect(hasArrow(wrapper)).toBe(false);
    });

    it('renders no arrow without a translate language', () => {
        expect(hasArrow(render({enabled: true}))).toBe(false);
    });

    describe('outside diff mode (translate tab behaviour is unchanged)', () => {
        const sbs = {enabled: true, translateLang: 'en', hasWritePermission: true};

        it('renders the restore arrow even when hasDiff is false', () => {
            const wrapper = render(sbs, {hasDiff: false});
            expect(hasArrow(wrapper)).toBe(true);
            expect(wrapper.find(Render).props().dataSelRole).toBe('translate-field');
        });

        it('enables the arrow from value + write permission', () => {
            expect(render(sbs).find(Render).props().enabled).toBe(true);
        });

        it('disables the arrow when locked', () => {
            const wrapper = render({...sbs, lockedAndCannotBeEdited: true});
            expect(wrapper.find(Render).props().enabled).toBe(false);
        });
    });

    describe('in diff mode (showDiff)', () => {
        const sbs = {enabled: true, translateLang: 'en', hasWritePermission: true, showDiff: true};

        it('renders the arrow only where the field differs', () => {
            expect(hasArrow(render(sbs, {hasDiff: true}))).toBe(true);
        });

        it('renders no arrow where the field does not differ', () => {
            expect(hasArrow(render(sbs, {hasDiff: false}))).toBe(false);
        });
    });

    it('copies the value into the i18n context on click', () => {
        const wrapper = render({enabled: true, translateLang: 'en', hasWritePermission: true});
        wrapper.find(Render).props().onClick();
        expect(setI18nContext).toHaveBeenCalledTimes(1);
    });
});
