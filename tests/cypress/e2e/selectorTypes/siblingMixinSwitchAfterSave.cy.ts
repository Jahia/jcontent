import {ContentEditor} from '../../page-object/contentEditor';
import {addNode, createSite, deleteNode, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, SmallTextField} from '../../page-object/fields';
import gql from 'graphql-tag';

// Follow-up of https://github.com/Jahia/jcontent/issues/2746
//
// Sibling template mixins that inherit the same property from a shared supertype each get their
// own form input (cemix:<player>GenericPlayer_sharedNote), hydrated when the editor loads. A switch
// of the choicelist must carry the value of the copy switched off to the copy switched on, or the
// editor shows the value of load time and a save writes it back over the stored one. A save that
// keeps the editor open does not reload the form, so it leaves the inactive copies as they loaded.
//
// The editor is opened with ContentEditor.visit(), the fullscreen editor, whose Save keeps the
// editor open (advancedMode), which is the situation under test.
describe('Sibling mixin switch after a save in the same editor session', () => {
    const siteKey = 'siblingMixinSwitchAfterSaveSite';
    const contents = `/sites/${siteKey}/contents`;
    const VIDEO_TYPE = 'cent:videoPlayerTest_videoType';

    const visitEditor = (name: string) => ContentEditor.visit(`${contents}/${name}`, siteKey, 'en', 'content-folders/contents');

    const readNode = (name: string) => cy.apollo({
        query: gql`query read($path: String!) {
            jcr {
                nodeByPath(path: $path) {
                    mixinTypes { name }
                    sharedNote: property(name: "sharedNote", language: "en") { value }
                    videoType: property(name: "videoType") { value }
                    youtubeId: property(name: "youtubeId", language: "en") { value }
                    vimeoId: property(name: "vimeoId", language: "en") { value }
                    switchTubeId: property(name: "switchTubeId", language: "en") { value }
                }
            }
        }`,
        variables: {path: `${contents}/${name}`},
        fetchPolicy: 'no-cache'
    }).then(resp => {
        const node = resp?.data?.jcr.nodeByPath;
        return {
            mixins: node.mixinTypes.map((m: {name: string}) => m.name).filter((n: string) => n.startsWith('cemix:')).sort()
                .join(', '),
            sharedNote: node.sharedNote?.value ?? null,
            videoType: node.videoType?.value ?? null,
            youtubeId: node.youtubeId?.value ?? null,
            vimeoId: node.vimeoId?.value ?? null,
            switchTubeId: node.switchTubeId?.value ?? null
        };
    });

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('shows the value saved in this session after switching to a sibling', () => {
        const name = 'savedThenSwitched';
        addNode({parentPathOrId: contents, name, primaryNodeType: 'cent:videoPlayerTest'});

        const contentEditor = visitEditor(name);
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:youtubeGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:youtubeGenericPlayer_sharedNote').addNewValue('first-value');
        contentEditor.getField(SmallTextField, 'cemix:youtubeGenericPlayer_youtubeId').addNewValue('yt-1');
        contentEditor.save();
        cy.get(ContentEditor.defaultSelector).should('be.visible');

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the first save').to.equal('cemix:youtubeGenericPlayer');
            expect(node.sharedNote, 'sharedNote after the first save').to.equal('first-value');
        });

        cy.log('switch to vimeo in the same editor session, without reloading it');
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').assertVisible()
            .checkValue('first-value');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_vimeoId').addNewValue('vm-1');
        contentEditor.save();
        contentEditor.cancel();

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the switch').to.equal('cemix:vimeoGenericPlayer');
            expect(node.sharedNote, 'sharedNote after the switch').to.equal('first-value');
        });

        const reopened = visitEditor(name);
        reopened.getField(ChoiceListField, VIDEO_TYPE).assertSelected('Vimeo');
        reopened.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').checkValue('first-value');
        reopened.cancel();

        deleteNode(`${contents}/${name}`);
    });

    it('does not write back the value from load time after a save in the same session', () => {
        const name = 'savedThenSwitchedBack';
        addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:videoPlayerTest',
            mixins: ['cemix:switchTubeGenericPlayer'],
            properties: [
                {name: 'videoType', value: 'cemix:switchTubeGenericPlayer'},
                {name: 'sharedNote', value: 'value-A', language: 'en'},
                {name: 'switchTubeId', value: 'st-1', language: 'en'}
            ]
        });

        readNode(name).then(node => {
            expect(node.mixins, 'mixin before the editor opens').to.equal('cemix:switchTubeGenericPlayer');
            expect(node.sharedNote, 'sharedNote before the editor opens').to.equal('value-A');
        });

        const contentEditor = visitEditor(name);
        contentEditor.getField(SmallTextField, 'cemix:switchTubeGenericPlayer_sharedNote').checkValue('value-A');
        contentEditor.getField(SmallTextField, 'cemix:switchTubeGenericPlayer_sharedNote').addNewValue('value-B');
        contentEditor.save();
        cy.get(ContentEditor.defaultSelector).should('be.visible');

        readNode(name).then(node => {
            expect(node.sharedNote, 'sharedNote after the first save').to.equal('value-B');
        });

        cy.log('switch to vimeo in the same editor session, without reloading it');
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').assertVisible()
            .checkValue('value-B');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_vimeoId').addNewValue('vm-1');
        contentEditor.save();
        contentEditor.cancel();

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the switch').to.equal('cemix:vimeoGenericPlayer');
            expect(node.sharedNote, 'sharedNote after the switch (value-A means the load-time value was written back)')
                .to.equal('value-B');
        });

        deleteNode(`${contents}/${name}`);
    });

    // Same flow as the first case without looking at the displayed value: does the save of the
    // switch keep or drop the value stored by the first save?
    it('keeps the value of the first save when switching to a sibling that was empty at load', () => {
        const name = 'savedThenSwitchedFromEmpty';
        addNode({parentPathOrId: contents, name, primaryNodeType: 'cent:videoPlayerTest'});

        const contentEditor = visitEditor(name);
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:youtubeGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:youtubeGenericPlayer_sharedNote').addNewValue('first-value');
        contentEditor.getField(SmallTextField, 'cemix:youtubeGenericPlayer_youtubeId').addNewValue('yt-1');
        contentEditor.save();
        cy.get(ContentEditor.defaultSelector).should('be.visible');

        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_vimeoId').addNewValue('vm-1');
        contentEditor.save();
        contentEditor.cancel();

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the switch').to.equal('cemix:vimeoGenericPlayer');
            expect(node.sharedNote, 'sharedNote after the switch').to.equal('first-value');
        });

        deleteNode(`${contents}/${name}`);
    });

    it('carries an unsaved edit of the shared value to the sibling switched on', () => {
        const name = 'unsavedThenSwitched';
        addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:videoPlayerTest',
            mixins: ['cemix:switchTubeGenericPlayer'],
            properties: [
                {name: 'videoType', value: 'cemix:switchTubeGenericPlayer'},
                {name: 'sharedNote', value: 'value-A', language: 'en'},
                {name: 'switchTubeId', value: 'st-1', language: 'en'}
            ]
        });

        const contentEditor = visitEditor(name);
        contentEditor.getField(SmallTextField, 'cemix:switchTubeGenericPlayer_sharedNote').addNewValue('value-B');

        cy.log('switch to vimeo without saving');
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').assertVisible()
            .checkValue('value-B');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_vimeoId').addNewValue('vm-1');
        contentEditor.save();
        contentEditor.cancel();

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the switch').to.equal('cemix:vimeoGenericPlayer');
            expect(node.sharedNote, 'sharedNote after the switch (value-A means the edit was lost)').to.equal('value-B');
        });

        deleteNode(`${contents}/${name}`);
    });
});
