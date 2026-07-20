import {buildTabOption} from './editHeaderTabOptions';

describe('buildTabOption', () => {
    const t = key => `t(${key})`;
    const baseTab = {
        value: 'version-history',
        buttonLabel: 'ns:label.tab.versionHistory',
        buttonIcon: 'icon-element',
        dataSelRole: 'tab-version-history'
    };

    it('maps a tab action to a moonstone Dropdown option', () => {
        expect(buildTabOption(baseTab, t)).toEqual({
            value: 'version-history',
            label: 't(ns:label.tab.versionHistory)',
            iconStart: 'icon-element',
            iconEnd: undefined,
            attributes: {'data-sel-role': 'tab-version-history'}
        });
    });

    it('translates the buttonLabel i18n key', () => {
        expect(buildTabOption(baseTab, t).label).toBe('t(ns:label.tab.versionHistory)');
    });

    it('surfaces a contributed buttonBadge as the trailing iconEnd', () => {
        const badge = {$$typeof: Symbol.for('react.element')}; // Stand-in for a React element
        expect(buildTabOption({...baseTab, buttonBadge: badge}, t).iconEnd).toBe(badge);
    });

    it('leaves iconEnd undefined when the tab contributes no badge', () => {
        expect(buildTabOption(baseTab, t).iconEnd).toBeUndefined();
    });
});
