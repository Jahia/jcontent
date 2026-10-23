import {print} from 'graphql';
import {buildAliasedMutation} from './undo.gql-utils';

const buildMove = (entry, index, declare) => {
    const node = declare(`u${index}`, 'String!');
    const parent = declare(`p${index}`, 'String!');
    return `mutateNode(pathOrId: ${node}) { move(parentPathOrId: ${parent}) }`;
};

describe('buildAliasedMutation', () => {
    it('should give every entry its own alias and its own selection', () => {
        const document = buildAliasedMutation({
            name: 'undoMove',
            entries: [{}, {}],
            buildEntry: buildMove
        });

        const printed = print(document);

        expect(printed).toContain('n0: mutateNode(pathOrId: $u0)');
        expect(printed).toContain('n1: mutateNode(pathOrId: $u1)');
        // The whole point of the helper: never one value applied to many nodes.
        expect(printed).not.toContain('mutateNodes');
    });

    it('should declare exactly the variables the entries asked for', () => {
        const printed = print(buildAliasedMutation({
            name: 'undoMove',
            entries: [{}, {}],
            buildEntry: buildMove
        }));

        expect(printed).toContain('$u0: String!');
        expect(printed).toContain('$p0: String!');
        expect(printed).toContain('$u1: String!');
        expect(printed).toContain('$p1: String!');
    });

    it('should declare nothing, and no empty parentheses, when no entry asks for a variable', () => {
        const document = buildAliasedMutation({
            name: 'undoNothing',
            entries: [{path: '/a'}],
            buildEntry: entry => `mutateNode(pathOrId: "${entry.path}") { delete }`
        });

        // An empty signature would be a syntax error, so parsing at all is the assertion.
        expect(print(document)).toContain('mutation undoNothing {');
    });

    it('should mix entries that set a value with entries that delete one', () => {
        const printed = print(buildAliasedMutation({
            name: 'undoValues',
            entries: [{value: 'kept'}, {value: null}],
            buildEntry: (entry, index, declare) => {
                if (entry.value === null) {
                    return `mutateNode(pathOrId: ${declare(`p${index}`, 'String!')}) { mutateProperty(name: "x") { delete } }`;
                }

                const path = declare(`p${index}`, 'String!');
                const value = declare(`v${index}`, 'String!');
                return `mutateNode(pathOrId: ${path}) { mutateProperty(name: "x") { setValue(value: ${value}) } }`;
            }
        }));

        expect(printed).toContain('$v0: String!');
        expect(printed).not.toContain('$v1');
        expect(printed).toContain('n1: mutateNode(pathOrId: $p1)');
    });

    it('should target the edit workspace unless told otherwise', () => {
        const edit = print(buildAliasedMutation({name: 'u', entries: [{}], buildEntry: buildMove}));
        const live = print(buildAliasedMutation({name: 'u', entries: [{}], workspace: 'LIVE', buildEntry: buildMove}));

        expect(edit).toContain('jcr(workspace: EDIT)');
        expect(live).toContain('jcr(workspace: LIVE)');
    });

    it('should build nothing when there is nothing to put back', () => {
        expect(buildAliasedMutation({name: 'u', entries: [], buildEntry: buildMove})).toBeNull();
        expect(buildAliasedMutation({name: 'u', entries: null, buildEntry: buildMove})).toBeNull();
    });
});
