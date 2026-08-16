import fs from 'fs';
import path from 'path';
import {POSSIBLE_TYPES} from './ContentSidePanelProviders';

/**
 * Regression guard for a silent failure mode: Apollo Client 3 needs `possibleTypes` to match
 * fragments declared on an interface. Without it, `...NodeCacheRequiredFields on JCRNode`
 * matches nothing and uuid/path/workspace disappear from every query result — the panel then
 * renders its "no content" state with no error anywhere.
 */
describe('fallback Apollo cache possibleTypes', () => {
    const schema = fs.readFileSync(path.resolve(__dirname, '../../../schema.graphql'), 'utf8');

    const implementorsFromSchema = () => {
        const implementors = {};

        for (const match of schema.matchAll(/^type\s+(\w+)\s+implements\s+([\w\s&]+?)\s*\{/gm)) {
            const [, type, interfaces] = match;
            interfaces.split('&').map(i => i.trim()).filter(Boolean).forEach(name => {
                implementors[name] = [...(implementors[name] || []), type];
            });
        }

        return implementors;
    };

    it('should declare every interface of the schema', () => {
        expect(Object.keys(POSSIBLE_TYPES).sort()).toEqual(Object.keys(implementorsFromSchema()).sort());
    });

    it('should list every implementation of each interface', () => {
        const expected = implementorsFromSchema();

        Object.keys(expected).forEach(name => {
            expect([...POSSIBLE_TYPES[name]].sort()).toEqual([...expected[name]].sort());
        });
    });

    it('should cover JCRNode, the interface every jcontent query spreads a fragment on', () => {
        expect(POSSIBLE_TYPES.JCRNode).toContain('GenericJCRNode');
    });
});
