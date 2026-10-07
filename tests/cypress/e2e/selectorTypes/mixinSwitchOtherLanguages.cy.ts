import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField} from '../../page-object/fields';
import gql from 'graphql-tag';

// Regression test for https://github.com/Jahia/jcontent/issues/2831
//
// Switching an addMixin choicelist between template mixins that share an i18n property must keep
// that property's value in every language, not only in the one being edited. The save removes the
// old mixin before it adds the new one, and core's removeMixin deletes the i18n properties no
// remaining type defines from every translation node -- so a language the editor does not write
// back loses its value.
describe('Mixin switch keeps the other languages', () => {
    const siteKey = 'mixinSwitchI18nSite';
    const contents = `/sites/${siteKey}/contents`;

    const CASES = [
        {
            name: 'sibling', type: 'cent:videoPlayerTest', field: 'cent:videoPlayerTest_videoType', choice: 'videoType',
            from: 'cemix:vimeoGenericPlayer', to: 'cemix:switchTubeGenericPlayer', props: ['sharedNote']
        },
        {
            name: 'chainDown', type: 'cent:actionTest', field: 'cent:actionTest_actionType', choice: 'actionType',
            from: 'cemix:chainSuccess', to: 'cemix:chainPopin', props: ['pageSuccess', 'toastSuccess']
        },
        {
            name: 'chainUpToSuccess', type: 'cent:actionTest', field: 'cent:actionTest_actionType', choice: 'actionType',
            from: 'cemix:chainPopin', to: 'cemix:chainSuccess', props: ['pageSuccess', 'toastSuccess']
        },
        {
            name: 'chainUpToRedirect', type: 'cent:actionTest', field: 'cent:actionTest_actionType', choice: 'actionType',
            from: 'cemix:chainPopin', to: 'cemix:chainRedirect', props: ['pageSuccess']
        }
    ];

    const read = (name: string, props: string[]) => cy.apollo({
        query: gql`query read($path: String!, $names: [String]) {
            jcr {
                nodeByPath(path: $path) {
                    mixinTypes { name }
                    en: properties(names: $names, language: "en") { name value }
                    fr: properties(names: $names, language: "fr") { name value }
                }
            }
        }`,
        variables: {path: `${contents}/${name}`, names: props},
        fetchPolicy: 'no-cache'
    }).then(resp => {
        const node = resp?.data?.jcr.nodeByPath;
        const values = (list: {name: string; value: string}[]) => Object.fromEntries(props.map(p => [p, list.find(x => x.name === p)?.value ?? null]));
        return {
            mixins: node.mixinTypes.map((m: {name: string}) => m.name).filter((n: string) => n.startsWith('cemix:')).sort().join(', '),
            en: values(node.en),
            fr: values(node.fr)
        };
    });

    const expected = (props: string[], lang: string) => Object.fromEntries(props.map(p => [p, `${p} ${lang}`]));

    before(() => {
        createSite(siteKey, {languages: 'en,fr', templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        enableModule('jcontent-test-module', siteKey);
        CASES.forEach(c => addNode({
            parentPathOrId: contents,
            name: c.name,
            primaryNodeType: c.type,
            mixins: [c.from],
            properties: [
                {name: c.choice, value: c.from},
                ...c.props.flatMap(p => ['en', 'fr'].map(language => ({name: p, value: `${p} ${language}`, language})))
            ]
        }));
    });

    after(() => {
        deleteSite(siteKey);
        cy.logout();
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    CASES.forEach(c => {
        it(`${c.name}: ${c.from} -> ${c.to} in en keeps en and fr`, () => {
            read(c.name, c.props).then(before => {
                expect(before, 'stored before the switch').to.deep.equal({mixins: c.from, en: expected(c.props, 'en'), fr: expected(c.props, 'fr')});
            });

            const contentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents').editComponentByRowName(c.name);
            contentEditor.getField(ChoiceListField, c.field).selectValue(c.to);
            contentEditor.save();

            read(c.name, c.props).then(after => {
                expect(after.mixins, 'mixin after the switch').to.equal(c.to);
                expect(after.en, 'en after the switch').to.deep.equal(expected(c.props, 'en'));
                expect(after.fr, 'fr after the switch').to.deep.equal(expected(c.props, 'fr'));
            });
        });
    });
});
