import {JContent} from '../../page-object';
import {addNode, createSite, deleteSite, enableModule} from '@jahia/cypress';
import {ChoiceListField} from '../../page-object/fields';
import gql from 'graphql-tag';

// Regression test for https://github.com/Jahia/jcontent/issues/2831
//
// Switching an addMixin choicelist between template mixins that share a property must keep that
// property's value in every language, not only in the one being edited, and in hidden fields the
// editor never writes back. The save removes the old mixin before it adds the new one, and core's
// removeMixin deletes the properties no remaining type defines, on the node and on every
// translation node. What only the old mixin defines must still be gone after the switch.
describe('Mixin switch keeps the other languages', () => {
    const siteKey = 'mixinSwitchI18nSite';
    const contents = `/sites/${siteKey}/contents`;

    interface SwitchCase {
        name: string;
        type: string;
        field: string;
        choice: string;
        from: string;
        to: string;
        // Translated properties the new mixin still defines: kept in en and fr
        translated: string[];
        // Shared (not translated) properties the new mixin still defines, with their stored value
        shared: Record<string, string>;
        // Translated properties only the old mixin defines: gone in en and fr
        dropped: string[];
    }

    // PageTarget and pageTracking are hidden fields. pageTarget is also autocreated with '_self',
    // which adding the next chain member writes back over the stored value.
    const CHAIN_SHARED = {pageTarget: '_blank'};

    const CASES: SwitchCase[] = [
        {
            name: 'sibling', type: 'cent:videoPlayerTest', field: 'cent:videoPlayerTest_videoType', choice: 'videoType',
            from: 'cemix:vimeoGenericPlayer', to: 'cemix:switchTubeGenericPlayer',
            translated: ['sharedNote'], shared: {sharedMode: 'manual'}, dropped: ['vimeoId']
        },
        {
            name: 'chainDown', type: 'cent:actionTest', field: 'cent:actionTest_actionType', choice: 'actionType',
            from: 'cemix:chainSuccess', to: 'cemix:chainPopin',
            translated: ['pageSuccess', 'pageTracking', 'toastSuccess'], shared: CHAIN_SHARED, dropped: []
        },
        {
            name: 'chainUpToSuccess', type: 'cent:actionTest', field: 'cent:actionTest_actionType', choice: 'actionType',
            from: 'cemix:chainPopin', to: 'cemix:chainSuccess',
            translated: ['pageSuccess', 'pageTracking', 'toastSuccess'], shared: CHAIN_SHARED, dropped: ['titrePopin']
        },
        {
            name: 'chainUpToRedirect', type: 'cent:actionTest', field: 'cent:actionTest_actionType', choice: 'actionType',
            from: 'cemix:chainPopin', to: 'cemix:chainRedirect',
            translated: ['pageSuccess', 'pageTracking'], shared: CHAIN_SHARED, dropped: ['toastSuccess', 'titrePopin']
        }
    ];

    const LANGUAGES = ['en', 'fr'];

    const names = (c: SwitchCase) => [...c.translated, ...Object.keys(c.shared), ...c.dropped];

    const read = (c: SwitchCase) => cy.apollo({
        query: gql`query read($path: String!, $names: [String]) {
            jcr {
                nodeByPath(path: $path) {
                    mixinTypes { name }
                    en: properties(names: $names, language: "en") { name value }
                    fr: properties(names: $names, language: "fr") { name value }
                }
            }
        }`,
        variables: {path: `${contents}/${c.name}`, names: names(c)},
        fetchPolicy: 'no-cache'
    }).then(resp => {
        const node = resp?.data?.jcr.nodeByPath;
        const values = (list: {name: string; value: string}[]) => Object.fromEntries(names(c).map(p => [p, list.find(x => x.name === p)?.value ?? null]));
        return {
            mixins: node.mixinTypes.map((m: {name: string}) => m.name).filter((n: string) => n.startsWith('cemix:')).sort().join(', '),
            en: values(node.en),
            fr: values(node.fr)
        };
    });

    // The values a language reads: every translated property in that language, every shared one
    const stored = (c: SwitchCase, lang: string, translated: string[]) => ({
        ...Object.fromEntries(translated.map(p => [p, `${p} ${lang}`])),
        ...c.shared
    });

    const gone = (props: string[]) => Object.fromEntries(props.map(p => [p, null]));

    before(() => {
        createSite(siteKey, {languages: LANGUAGES.join(','), templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en'});
        enableModule('jcontent-test-module', siteKey);
        CASES.forEach(c => addNode({
            parentPathOrId: contents,
            name: c.name,
            primaryNodeType: c.type,
            mixins: [c.from],
            properties: [
                {name: c.choice, value: c.from},
                ...Object.entries(c.shared).map(([name, value]) => ({name, value})),
                ...[...c.translated, ...c.dropped].flatMap(p => LANGUAGES.map(language => ({name: p, value: `${p} ${language}`, language})))
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
        it(`${c.name}: ${c.from} -> ${c.to} in en keeps what the new mixin defines, in en and fr`, () => {
            read(c).then(before => {
                expect(before, 'stored before the switch').to.deep.equal({
                    mixins: c.from,
                    en: stored(c, 'en', [...c.translated, ...c.dropped]),
                    fr: stored(c, 'fr', [...c.translated, ...c.dropped])
                });
            });

            const contentEditor = JContent.visit(siteKey, 'en', 'content-folders/contents').editComponentByRowName(c.name);
            contentEditor.getField(ChoiceListField, c.field).selectValue(c.to);
            contentEditor.save();

            read(c).then(after => {
                expect(after.mixins, 'mixin after the switch').to.equal(c.to);
                LANGUAGES.forEach(lang => {
                    Object.entries({...stored(c, lang, c.translated), ...gone(c.dropped)}).forEach(([name, value]) => {
                        expect(after[lang][name], `${name} in ${lang} after the switch`).to.equal(value);
                    });
                });
            });
        });
    });
});
