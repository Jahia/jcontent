import {
    createGroup,
    createSite,
    createUser,
    deleteGroup,
    deleteSite,
    deleteUser
} from '@jahia/cypress';
import gql from 'graphql-tag';

// Endpoint tests for the dedicated, optimized user/group search GraphQL API
// (jcontent.userSearch / jcontent.groupSearch) that replaced the inefficient
// "SELECT * FROM [jnt:user] WHERE ISDESCENDANTNODE(...)" picker query.
describe('jContent principal search GraphQL endpoint', () => {
    const siteKey = 'principalSearchSite';
    const prefix = 'jcontentsearch';
    const users = [
        {name: `${prefix}user1`, firstName: 'Alice', lastName: 'Anderson'},
        {name: `${prefix}user2`, firstName: 'Bob', lastName: 'Brown'},
        {name: `${prefix}user3`, firstName: 'Carol', lastName: 'Clark'}
    ];
    const globalGroup = `${prefix}groupglobal`;
    const siteGroup = `${prefix}groupsite`;

    const USER_SEARCH = gql`
        query UserSearch($siteKey: String!, $scopePath: String!, $searchTerm: String, $offset: Int, $limit: Int, $fieldSorter: InputFieldSorterInput) {
            jcontent {
                userSearch(siteKey: $siteKey, scopePath: $scopePath, searchTerm: $searchTerm, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                        name
                        path
                    }
                }
            }
        }
    `;

    const GROUP_SEARCH = gql`
        query GroupSearch($siteKey: String!, $scopePath: String!, $searchTerm: String, $offset: Int, $limit: Int, $fieldSorter: InputFieldSorterInput) {
            jcontent {
                groupSearch(siteKey: $siteKey, scopePath: $scopePath, searchTerm: $searchTerm, offset: $offset, limit: $limit, fieldSorter: $fieldSorter) {
                    pageInfo {
                        totalCount
                    }
                    nodes {
                        name
                        path
                    }
                }
            }
        }
    `;

    const names = result => result.data.jcontent.userSearch.nodes.map(n => n.name);
    const groupNames = result => result.data.jcontent.groupSearch.nodes.map(n => n.name);

    before('provision site, users and groups', () => {
        createSite(siteKey);
        users.forEach(u => createUser(u.name, 'password', [
            {name: 'j:firstName', value: u.firstName},
            {name: 'j:lastName', value: u.lastName}
        ]));
        createGroup(globalGroup);
        createGroup(siteGroup, false, siteKey);
    });

    after('cleanup', () => {
        users.forEach(u => deleteUser(u.name));
        deleteGroup(globalGroup);
        deleteGroup(siteGroup, siteKey);
        deleteSite(siteKey);
    });

    it('returns global users matching a term with the correct total count', () => {
        cy.apollo({
            query: USER_SEARCH,
            variables: {siteKey, scopePath: '/users', searchTerm: prefix, offset: 0, limit: 25}
        }).then(result => {
            expect(result.data.jcontent.userSearch.pageInfo.totalCount).to.eq(users.length);
            users.forEach(u => expect(names(result)).to.include(u.name));
        });
    });

    it('narrows results down to a single user', () => {
        cy.apollo({
            query: USER_SEARCH,
            variables: {siteKey, scopePath: '/users', searchTerm: `${prefix}user2`, offset: 0, limit: 25}
        }).then(result => {
            expect(result.data.jcontent.userSearch.pageInfo.totalCount).to.eq(1);
            expect(names(result)).to.deep.eq([`${prefix}user2`]);
        });
    });

    it('returns no results for a non-matching term', () => {
        cy.apollo({
            query: USER_SEARCH,
            variables: {siteKey, scopePath: '/users', searchTerm: 'zzz-no-such-principal-zzz', offset: 0, limit: 25}
        }).then(result => {
            expect(result.data.jcontent.userSearch.pageInfo.totalCount).to.eq(0);
            expect(result.data.jcontent.userSearch.nodes).to.have.length(0);
        });
    });

    it('paginates with offset/limit while keeping the full total count', () => {
        cy.apollo({
            query: USER_SEARCH,
            variables: {siteKey, scopePath: '/users', searchTerm: prefix, offset: 0, limit: 2}
        }).then(result => {
            expect(result.data.jcontent.userSearch.pageInfo.totalCount).to.eq(users.length);
            expect(result.data.jcontent.userSearch.nodes).to.have.length(2);
        });
    });

    it('orders results by the provided field sorter', () => {
        cy.apollo({
            query: USER_SEARCH,
            variables: {
                siteKey,
                scopePath: '/users',
                searchTerm: prefix,
                offset: 0,
                limit: 25,
                fieldSorter: {fieldName: 'displayName', sortType: 'DESC', ignoreCase: true}
            }
        }).then(result => {
            expect(names(result)).to.deep.eq([`${prefix}user3`, `${prefix}user2`, `${prefix}user1`]);
        });
    });

    it('scopes groups to global, site and combined searches', () => {
        cy.apollo({
            query: GROUP_SEARCH,
            variables: {siteKey, scopePath: '/groups', searchTerm: prefix, offset: 0, limit: 25}
        }).then(result => {
            expect(groupNames(result)).to.include(globalGroup);
            expect(groupNames(result)).to.not.include(siteGroup);
        });

        cy.apollo({
            query: GROUP_SEARCH,
            variables: {siteKey, scopePath: `/sites/${siteKey}/groups`, searchTerm: prefix, offset: 0, limit: 25}
        }).then(result => {
            expect(groupNames(result)).to.include(siteGroup);
            expect(groupNames(result)).to.not.include(globalGroup);
        });

        cy.apollo({
            query: GROUP_SEARCH,
            variables: {siteKey, scopePath: '/', searchTerm: prefix, offset: 0, limit: 25}
        }).then(result => {
            expect(groupNames(result)).to.include(globalGroup);
            expect(groupNames(result)).to.include(siteGroup);
        });
    });
});
