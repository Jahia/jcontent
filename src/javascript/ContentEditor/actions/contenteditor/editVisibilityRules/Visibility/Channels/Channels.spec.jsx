import {CHANNELS_FIELDSET, getChannelsFieldSet} from './Channels';

const channelsFieldSet = overrides => ({
    name: CHANNELS_FIELDSET,
    dynamic: true,
    hasEnableSwitch: true,
    activated: false,
    fields: [{name: 'jmix:channelSelection_j:channelSelection'}, {name: 'jmix:channelSelection_j:channelIncludeOrExclude'}],
    ...overrides
});

const visibilitySections = fieldSets => [
    {name: 'content', fieldSets: [{name: 'jnt:text', fields: [{name: 'jnt:text_text'}]}]},
    {name: 'visibility', fieldSets}
];

describe('getChannelsFieldSet', () => {
    it('returns the channel fieldset of the visibility section when the mixin can be switched on', () => {
        const fieldSet = channelsFieldSet();
        expect(getChannelsFieldSet(visibilitySections([{name: 'jmix:i18n', fields: []}, fieldSet]))).toBe(fieldSet);
    });

    it('returns null when the channels module adds no fieldset', () => {
        expect(getChannelsFieldSet(visibilitySections([{name: 'jmix:i18n', fields: []}]))).toBeNull();
    });

    it('returns null when there is no visibility section', () => {
        expect(getChannelsFieldSet([{name: 'content', fieldSets: []}])).toBeNull();
    });

    it('returns null for an inactive dynamic fieldset without a switch', () => {
        expect(getChannelsFieldSet(visibilitySections([channelsFieldSet({hasEnableSwitch: false})]))).toBeNull();
    });

    it('returns null for an empty static fieldset', () => {
        expect(getChannelsFieldSet(visibilitySections([channelsFieldSet({dynamic: false, fields: []})]))).toBeNull();
    });
});
