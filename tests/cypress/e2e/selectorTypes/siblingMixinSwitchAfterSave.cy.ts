import {ContentEditor} from '../../page-object/contentEditor';
import {addNode, createSite, deleteNode, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField, SmallTextField} from '../../page-object/fields';
import gql from 'graphql-tag';

interface FieldConstraintsOp {
    operationName?: string;
    variables?: {
        nodeType?: string;
        fieldName?: string;
        context?: Array<{key: string; value: string}>;
    };
}

const fieldConstraintsOps = (body: unknown): FieldConstraintsOp[] =>
    (Array.isArray(body) ? body : [body]).filter((op: FieldConstraintsOp) => op?.operationName === 'fieldConstraints');

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
                    sharedPoster: property(name: "sharedPoster") { value }
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
            switchTubeId: node.switchTubeId?.value ?? null,
            sharedPoster: node.sharedPoster?.value ?? null
        };
    });

    const posterUuids: Record<string, string> = {};

    before(() => {
        createSite(siteKey);
        enableModule('jcontent-test-module', siteKey);
        addNode({parentPathOrId: contents, name: 'posters', primaryNodeType: 'jnt:contentFolder'});
        ['posterA', 'posterB'].forEach(poster => {
            addNode({
                parentPathOrId: `${contents}/posters`,
                name: poster,
                primaryNodeType: 'jnt:text',
                properties: [{name: 'text', value: poster, language: 'en'}]
            }).then(resp => {
                posterUuids[poster] = resp.data.jcr.addNode.uuid;
            });
        });
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

    // A sibling that inherits none of the shared properties has no copy to carry, so the value saved
    // before it must still reach the sibling switched on after it.
    it('keeps the value saved in this session through a sibling that has no copy of it', () => {
        const name = 'savedThenSwitchedThroughNative';
        addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:videoPlayerTest',
            mixins: ['cemix:youtubeGenericPlayer'],
            properties: [
                {name: 'videoType', value: 'cemix:youtubeGenericPlayer'},
                {name: 'sharedNote', value: 'value-A', language: 'en'},
                {name: 'youtubeId', value: 'yt-1', language: 'en'}
            ]
        });

        const contentEditor = visitEditor(name);
        contentEditor.getField(SmallTextField, 'cemix:youtubeGenericPlayer_sharedNote').addNewValue('value-B');
        contentEditor.save();
        cy.get(ContentEditor.defaultSelector).should('be.visible');

        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoNativePlayer');
        cy.get('[data-sel-content-editor-field$="_sharedNote"]').should('not.exist');
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_sharedNote').assertVisible()
            .checkValue('value-B');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_vimeoId').addNewValue('vm-1');
        contentEditor.save();
        contentEditor.cancel();

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the switches').to.equal('cemix:vimeoGenericPlayer');
            expect(node.sharedNote, 'sharedNote after the switches (value-A means the load-time value was written back)')
                .to.equal('value-B');
        });

        deleteNode(`${contents}/${name}`);
    });

    // The flow of the QA report, with the picker it used: change the reference, save, then switch.
    it('keeps a reference picked in this session through a sibling that has no copy of it', () => {
        const name = 'pickedThenSwitched';
        addNode({
            parentPathOrId: contents,
            name,
            primaryNodeType: 'cent:videoPlayerTest',
            mixins: ['cemix:switchTubeGenericPlayer'],
            properties: [
                {name: 'videoType', value: 'cemix:switchTubeGenericPlayer'},
                {name: 'switchTubeId', value: 'st-1', language: 'en'}
            ]
        });
        cy.then(() => cy.apollo({
            mutation: gql`mutation poster($path: String!, $uuid: String!) {
                jcr { mutateNode(pathOrId: $path) { mutateProperty(name: "sharedPoster") { setValue(value: $uuid) } } }
            }`,
            variables: {path: `${contents}/${name}`, uuid: posterUuids.posterA}
        }));

        const contentEditor = visitEditor(name);
        const switchTubePoster = contentEditor.getPickerField('cemix:switchTubeGenericPlayer_sharedPoster');
        switchTubePoster.assertValue('posterA');
        const picker = switchTubePoster.open();
        const contentFolders = picker.getAccordionItem('picker-content-folders');
        contentFolders.click();
        picker.wait();
        picker.navigateTo(contentFolders, 'contents/posters');
        picker.getTable().getRows().get().contains('posterB').click();
        picker.select();
        switchTubePoster.assertValue('posterB');
        contentEditor.save();
        cy.get(ContentEditor.defaultSelector).should('be.visible');
        readNode(name).then(node => {
            expect(node.sharedPoster, 'sharedPoster after the first save').to.equal(posterUuids.posterB);
        });

        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoNativePlayer');
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getPickerField('cemix:vimeoGenericPlayer_sharedPoster').assertValue('posterB');
        contentEditor.getField(SmallTextField, 'cemix:vimeoGenericPlayer_vimeoId').addNewValue('vm-1');
        contentEditor.save();
        contentEditor.cancel();

        readNode(name).then(node => {
            expect(node.mixins, 'mixin after the switches').to.equal('cemix:vimeoGenericPlayer');
            expect(node.sharedPoster, 'sharedPoster after the switches (posterA means the load-time value was written back)')
                .to.equal(posterUuids.posterB);
        });

        deleteNode(`${contents}/${name}`);
    });

    // A value set in code reaches the handlers of the copy switched on through its field, which
    // notifies them of every change of its value: sharedQuality depends on sharedZone.
    it('refreshes a dependent choicelist from the value carried to the sibling switched on', () => {
        const name = 'carriedDependency';
        addNode({parentPathOrId: contents, name, primaryNodeType: 'cent:videoPlayerTest'});

        // Selected here rather than stored: on a node that carries the mixin, the choicelist moves its
        // fields next to it once the form has rendered, and a click on one of them can land mid-move
        const contentEditor = visitEditor(name);
        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:vimeoGenericPlayer');
        contentEditor.getField(ChoiceListField, 'cemix:vimeoGenericPlayer_sharedZone').selectValue('eu');

        const ops: FieldConstraintsOp[] = [];
        cy.intercept('POST', '**/modules/graphql', req => {
            ops.push(...fieldConstraintsOps(req.body));
        });

        contentEditor.getField(ChoiceListField, VIDEO_TYPE).selectValue('cemix:switchTubeGenericPlayer');
        contentEditor.getField(ChoiceListField, 'cemix:switchTubeGenericPlayer_sharedZone').assertSelected('eu');
        cy.wrap(ops).should(list => {
            const zones = list
                .filter(op => op.variables?.nodeType === 'cemix:switchTubeGenericPlayer' && op.variables?.fieldName === 'sharedQuality')
                .map(op => op.variables?.context?.find(entry => entry.key === 'sharedZone')?.value);
            expect(zones, 'sharedZone in the refetches of switchTube\'s sharedQuality').to.include('eu');
        });

        contentEditor.cancelAndDiscard();
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
