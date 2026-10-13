import {registerChoiceListOnChange} from './registerChoiceListOnChange';
import {contentEditorHelper} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/contentEditorHelper';

const players = ['cemix:youtubeGenericPlayer', 'cemix:vimeoGenericPlayer', 'cemix:switchTubeGenericPlayer'];

const sharedNote = player => ({
    nodeType: player,
    name: `${player}_sharedNote`,
    propertyName: 'sharedNote',
    declaringNodeType: 'cemix:sharedPlayerOptions'
});

const ownId = player => ({
    nodeType: player,
    name: `${player}_ownId`,
    propertyName: 'ownId',
    declaringNodeType: player
});

const videoType = {
    nodeType: 'cent:videoPlayerTest',
    name: 'cent:videoPlayerTest_videoType',
    propertyName: 'videoType',
    multiple: false,
    valueConstraints: players.map(player => ({
        value: {string: player},
        properties: [{name: 'addMixin', value: player}]
    }))
};

const buildSections = () => [{
    name: 'content',
    fieldSets: [
        {name: 'cent:videoPlayerTest', dynamic: false, activated: true, fields: [videoType]},
        ...players.map(player => ({
            name: player,
            dynamic: true,
            activated: false,
            fields: [ownId(player), sharedNote(player)]
        }))
    ]
}];

const buildFormik = values => {
    const formik = {
        values: {...values},
        setFieldValue: jest.fn((name, value) => {
            formik.values[name] = value;
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

    const switchPlayer = (from, to, formik) => onChange(from, to, videoType, {sections: buildSections(), formik}, undefined, contentEditorHelper);

    it('carries the value of a shared inherited property to the sibling switched on', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_sharedNote': 'saved in this session',
            'cemix:vimeoGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBe('saved in this session');
    });

    it('carries an empty value, so a property cleared before the switch stays cleared', () => {
        const formik = buildFormik({
            'cemix:switchTubeGenericPlayer_sharedNote': undefined,
            'cemix:vimeoGenericPlayer_sharedNote': 'loaded with the form'
        });

        switchPlayer('cemix:switchTubeGenericPlayer', 'cemix:vimeoGenericPlayer', formik);

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBeUndefined();
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

        expect(formik.values['cemix:vimeoGenericPlayer_sharedNote']).toBe('loaded with the form');
        expect(formik.setFieldValue).not.toHaveBeenCalledWith('cemix:vimeoGenericPlayer_sharedNote', expect.anything());
    });
});
