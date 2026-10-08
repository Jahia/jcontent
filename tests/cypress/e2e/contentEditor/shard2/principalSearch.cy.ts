import {
    createGroup,
    createSite,
    createUser,
    deleteGroup,
    deleteSite,
    deleteUser,
    grantRoles
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
    const otherSiteKey = 'principalSearchOtherSite';
    const editor = {name: 'principalsearcheditor', password: 'password'};
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

    const PRINCIPAL_FIELDS = gql`
        query PrincipalFields($siteKey: String!, $searchTerm: String) {
            jcontent {
                userSearch(siteKey: $siteKey, scopePath: "/users", searchTerm: $searchTerm) {
                    nodes {
                        uuid
                        path
                        name
                        displayName
                        nodeTypeName
                        firstName
                        lastName
                        provider
                        site {
                            siteKey
                            displayName
                        }
                    }
                }
            }
        }
    `;

    const names = result => result.data.jcontent.userSearch.nodes.map(n => n.name);
    const groupNames = result => result.data.jcontent.groupSearch.nodes.map(n => n.name);

    before('provision site, users and groups', () => {
        createSite(siteKey);
        createSite(otherSiteKey);
        users.forEach(u => createUser(u.name, 'password', [
            {name: 'j:firstName', value: u.firstName},
            {name: 'j:lastName', value: u.lastName}
        ]));
        createGroup(globalGroup);
        createGroup(siteGroup, false, siteKey);
        createUser(editor.name, editor.password);
        grantRoles(`/sites/${siteKey}`, ['editor'], editor.name, 'USER');
    });

    after('cleanup', () => {
        cy.apolloClient();
        users.forEach(u => deleteUser(u.name));
        deleteUser(editor.name);
        deleteGroup(globalGroup);
        deleteGroup(siteGroup, siteKey);
        deleteSite(siteKey);
        deleteSite(otherSiteKey);
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

    it('returns the values a picker displays for each user', () => {
        cy.apollo({
            query: PRINCIPAL_FIELDS,
            variables: {siteKey, searchTerm: `${prefix}user1`}
        }).then(result => {
            const [user] = result.data.jcontent.userSearch.nodes;
            expect(user.name).to.eq(`${prefix}user1`);
            expect(user.nodeTypeName).to.eq('jnt:user');
            expect(user.firstName).to.eq('Alice');
            expect(user.lastName).to.eq('Anderson');
            expect(user.provider).to.eq('default');
            expect(user.uuid).to.be.a('string').and.not.be.empty;
            expect(user.site.siteKey).to.eq('systemsite');
        });
    });

    describe('as an editor of one site', () => {
        beforeEach(() => {
            cy.apolloClient({username: editor.name, password: editor.password});
        });

        afterEach(() => {
            cy.apolloClient();
        });

        it('lists users and groups for the site the editor works on', () => {
            cy.apollo({
                query: USER_SEARCH,
                variables: {siteKey, scopePath: '/users', searchTerm: prefix, offset: 0, limit: 25}
            }).then(result => {
                users.forEach(u => expect(names(result)).to.include(u.name));
            });

            cy.apollo({
                query: GROUP_SEARCH,
                variables: {siteKey, scopePath: '/', searchTerm: prefix, offset: 0, limit: 25}
            }).then(result => {
                expect(groupNames(result)).to.include(globalGroup);
                expect(groupNames(result)).to.include(siteGroup);
            });
        });

        it('lists nothing for a site the editor does not work on', () => {
            cy.apollo({
                query: USER_SEARCH,
                variables: {siteKey: otherSiteKey, scopePath: '/users', searchTerm: prefix, offset: 0, limit: 25}
            }).then(result => {
                expect(result.data.jcontent.userSearch.pageInfo.totalCount).to.eq(0);
            });

            cy.apollo({
                query: GROUP_SEARCH,
                variables: {siteKey, scopePath: `/sites/${otherSiteKey}/groups`, searchTerm: '', offset: 0, limit: 25}
            }).then(result => {
                expect(result.data.jcontent.groupSearch.pageInfo.totalCount).to.eq(0);
            });
        });
    });
});
