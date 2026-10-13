import {registerChoiceListOnChange} from './registerChoiceListOnChange';
import {contentEditorHelper} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/contentEditorHelper';

const players = ['cemix:youtubeGenericPlayer', 'cemix:vimeoGenericPlayer', 'cemix:switchTubeGenericPlayer'];
const nativePlayer = 'cemix:vimeoNativePlayer';

const copy = (fieldSet, propertyName, declaringNodeType) => ({
    nodeType: fieldSet,
    name: `${fieldSet}_${propertyName}`,
    propertyName,
    declaringNodeType
});

const sharedNote = player => copy(player, 'sharedNote', 'cemix:sharedPlayerOptions');
const sharedTags = player => ({...copy(player, 'sharedTags', 'cemix:sharedPlayerOptions'), multiple: true});

const choicelist = (mixins, multiple = false) => ({
    nodeType: 'cent:videoPlayerTest',
    name: 'cent:videoPlayerTest_videoType',
    propertyName: 'videoType',
    multiple,
    valueConstraints: mixins.map(mixin => ({
        value: {string: mixin},
        properties: [{name: 'addMixin', value: mixin}]
    }))
});

const buildSections = (choicelistField, fieldSets) => [{
    name: 'content',
    fieldSets: [
        {name: 'cent:videoPlayerTest', dynamic: false, activated: true, fields: [choicelistField]},
        ...fieldSets.map(({name, fields}) => ({name, dynamic: true, activated: false, fields}))
    ]
}];

const playerFieldSets = [
    ...players.map(player => ({
        name: player,
        fields: [copy(player, 'ownId', player), sharedNote(player), sharedTags(player)]
    })),
    {name: nativePlayer, fields: [copy(nativePlayer, 'vimeoId', 'cemix:vimeoPlayerId')]}
];

// Formik deletes a key set to undefined (setIn), so the mock does too
const buildFormik = values => {
    const formik = {
        values: {...values},
        setFieldValue: jest.fn((name, value) => {
            if (value === undefined) {
                delete formik.values[name];
            } else {
                formik.values[name] = value;
            }
        }),
        setFieldTouched: jest.fn()
    };
    return formik;
};

describe('registerChoiceListOnChange', () => {
    let onChange;

    beforeEach(() => {
        const registry = {add: jest.fn((type, key, entry) => {
            onChange = entry.onChange;
        })};
        registerChoiceListOnChange(registry);
    });

    const switchMixins = ({field, fieldSets, from, to, formik}) =>
        onChange(from, to, field, {sections: buildSections(field, fieldSets), formik}, undefined, contentEditorHelper);

    const switchPlayer = (from, to, formik) =>
        switchMixins({field: choicelist([...players, nativePlayer]), fieldSets: playerFieldSets, from, to, formik});

    it('carries the value of a shared inherited property to the sibling switched on', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_sharedNote': 'saved in this session',
            'cemix:vimeoGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBe('saved in this session');
    });

    it('carries the value to every other copy, so a switch through a sibling without one keeps it', () => {
        const formik = buildFormik({
            'cemix:youtubeGenericPlayer_sharedNote': 'saved in this session',
            'cemix:vimeoGenericPlayer_sharedNote': 'loaded with the form',
            'cemix:switchTubeGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchPlayer('cemix:youtubeGenericPlayer', nativePlayer, formik);
        switchPlayer(nativePlayer, 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBe('saved in this session');
        expect(formik.values['cemix:switchTubeGenericPlayer_sharedNote']).toBe('saved in this session');
    });

    it('carries a cleared value', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_sharedNote': null,
            'cemix:vimeoGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBeNull();
    });

    it('carries nothing from a copy that holds no value, so the copy switched on keeps its default', () => {
        const formik = buildFormik({'cemix:vimeoGenericPlayer_sharedNote': 'default'});

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBe('default');
    });

    it('leaves a property the sibling declares itself', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_ownId': 'switchTube id',
            'cemix:vimeoGenericPlayer_ownId': 'vimeo id'
        });

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_ownId']).toBe('vimeo id');
    });

    it('carries nothing when the form loads, as no mixin is switched off', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_sharedNote': 'other copy',
            'cemix:vimeoGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchPlayer(undefined, 'cemix:vimeoGenericPlayer', formik);

        expect(formik.setFieldValue).not.toHaveBeenCalledWith('cemix:vimeoGenericPlayer_sharedNote', expect.anything());
    });

    it('takes the value from a mixin that stays active over one switched off', () => {
        const field = choicelist(players, true);
        const formik = buildFormik({
            'cemix:youtubeGenericPlayer_sharedNote': 'switched off',
            'cemix:vimeoGenericPlayer_sharedNote': 'seen by the reader',
            'cemix:switchTubeGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchMixins({
            field,
            fieldSets: playerFieldSets,
            from: ['cemix:youtubeGenericPlayer', 'cemix:vimeoGenericPlayer'],
            to: ['cemix:vimeoGenericPlayer', 'cemix:switchTubeGenericPlayer'],
            formik
        });

        expect(formik.values['cemix:switchTubeGenericPlayer_sharedNote']).toBe('seen by the reader');
        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBe('seen by the reader');
    });

    it('carries a copy of a multiple value, and sets no copy that already holds it', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_sharedTags': ['a', 'b'],
            'cemix:vimeoGenericPlayer_sharedTags': ['old'],
            'cemix:youtubeGenericPlayer_sharedTags': ['a', 'b']
        });

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedTags']).toEqual(['a', 'b']);
        expect(formik.values['cemix:vimeoGenericPlayer_sharedTags']).not.toBe(formik.values['cemix:switchTubeGenericPlayer_sharedTags']);
        expect(formik.setFieldValue).not.toHaveBeenCalledWith('cemix:youtubeGenericPlayer_sharedTags', expect.anything());
    });

    it('carries a property of a chain to the member that declares it', () => {
        const chain = ['cemix:chainRedirect', 'cemix:chainSuccess'];
        const chainFieldSets = [
            {name: 'cemix:chainRedirect', fields: [copy('cemix:chainRedirect', 'pageSuccess', 'cemix:chainRedirect')]},
            {name: 'cemix:chainSuccess', fields: [copy('cemix:chainSuccess', 'pageSuccess', 'cemix:chainRedirect')]}
        ];
        const formik = buildFormik({
            'cemix:chainSuccess_pageSuccess': 'edited on success',
            'cemix:chainRedirect_pageSuccess': 'loaded with the form'
        });

        switchMixins({field: choicelist(chain), fieldSets: chainFieldSets, from: 'cemix:chainSuccess', to: 'cemix:chainRedirect', formik});

        expect(formik.values['cemix:chainRedirect_pageSuccess']).toBe('edited on success');
    });
});
