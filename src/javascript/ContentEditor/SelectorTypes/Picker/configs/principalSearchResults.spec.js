import {toPrincipalRows} from './principalSearchResults';

describe('toPrincipalRows', () => {
    const user = {
        uuid: 'user-uuid',
        path: '/users/ab/cd/ef/alice',
        name: 'alice',
        displayName: 'alice',
        nodeTypeName: 'jnt:user',
        firstName: 'Alice',
        lastName: 'Anderson',
        provider: 'default',
        siteInfo: {siteKey: 'systemsite', displayName: 'System Site'}
    };
    const group = {
        ...user,
        uuid: 'group-uuid',
        path: '/groups/editors',
        name: 'editors',
        displayName: 'editors',
        nodeTypeName: 'jnt:group',
        firstName: null,
        lastName: null
    };

    it('keeps the page information', () => {
        const rows = toPrincipalRows({pageInfo: {totalCount: 2}, nodes: [user, group]});
        expect(rows.pageInfo.totalCount).toBe(2);
        expect(rows.nodes).toHaveLength(2);
    });

    it('gives each row the fields the picker table reads', () => {
        const [row] = toPrincipalRows({pageInfo: {totalCount: 1}, nodes: [user]}).nodes;
        expect(row.uuid).toBe('user-uuid');
        expect(row.path).toBe('/users/ab/cd/ef/alice');
        expect(row.primaryNodeType).toEqual({name: 'jnt:user'});
        expect(row.isSelectable).toBe(true);
        expect(row.firstName).toEqual({value: 'Alice'});
        expect(row.lastName).toEqual({value: 'Anderson'});
        expect(row.siteInfo.displayName).toBe('System Site');
        expect(row.provider).toBe('default');
    });

    it('leaves the names of a group empty', () => {
        const [row] = toPrincipalRows({pageInfo: {totalCount: 1}, nodes: [group]}).nodes;
        expect(row.firstName).toBeNull();
        expect(row.lastName).toBeNull();
        expect(row.primaryNodeType).toEqual({name: 'jnt:group'});
    });

    it('returns nothing while there is no result', () => {
        expect(toPrincipalRows(undefined)).toBeUndefined();
    });
});
