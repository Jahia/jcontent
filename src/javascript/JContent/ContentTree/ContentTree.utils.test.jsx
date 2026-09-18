import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {convertPathsToTree, findInTree, getAncestorPaths, getParentPath} from './ContentTree.utils';

describe('getParentPath', () => {
    it('should return parent path', () => {
        expect(getParentPath('/sites/testsite/home')).toEqual('/sites/testsite');
        expect(getParentPath('/sites/testsite/home/about')).toEqual('/sites/testsite/home');
        expect(getParentPath('/sites/testsite')).toEqual('/sites');
        expect(getParentPath('/a/b/c/d')).toEqual('/a/b/c');
    });
});

describe('getAncestorPaths', () => {
    it('should return every ancestor up to and including rootPath', () => {
        expect(getAncestorPaths('/sites/testsite/home/about/history', '/sites/testsite')).toEqual([
            '/sites/testsite/home/about',
            '/sites/testsite/home',
            '/sites/testsite'
        ]);
    });

    it('should return only rootPath for a direct child of the root', () => {
        expect(getAncestorPaths('/sites/testsite/home', '/sites/testsite')).toEqual(['/sites/testsite']);
    });

    it('should return an empty array when the path is the root itself', () => {
        expect(getAncestorPaths('/sites/testsite', '/sites/testsite')).toEqual([]);
    });
});

describe('findInTree', () => {
    let tree = [{
        id: 'grandParent',
        children: [{
            id: 'parent1',
            children: []
        }, {
            id: 'parent2',
            children: []
        }, {
            id: 'parent3',
            children: [{
                id: 'child3.1',
                children: []
            }]
        }]
    }];

    expect(findInTree(tree, 'parent1')).toEqual({id: 'parent1', children: []});
    expect(findInTree(tree, 'grandParent')).toEqual(tree[0]);
    expect(findInTree(tree, 'parent2')).toEqual({id: 'parent2', children: []});
    expect(findInTree(tree, 'parent3')).toEqual({id: 'parent3', children: [{id: 'child3.1', children: []}]});
    expect(findInTree(tree, 'child3.1')).toEqual({id: 'child3.1', children: []});
});

describe('convertPathsToTree', () => {
    let entries = [{
        path: '/sites/testsite',
        node: {
            primaryNodeType: {
                name: 'jnt:vitrualSite'
            },
            displayName: 'Testsite'
        },
        hasChildren: true,
        virtualRow: {
            start: 0
        }
    }, {
        path: '/sites/testsite/home',
        node: {
            primaryNodeType: {
                name: 'jnt:page'
            },
            displayName: 'Home'
        },
        hasChildren: true,
        virtualRow: {
            start: 0
        }
    }, {
        path: '/sites/testsite/home/about',
        node: {
            primaryNodeType: {
                name: 'jnt:page'
            },
            displayName: 'About'
        },
        hasChildren: true,
        virtualRow: {
            start: 0
        }
    }, {
        path: '/sites/testsite/home/about/history',
        node: {
            primaryNodeType: {
                name: 'jnt:page'
            },
            displayName: 'History'
        },
        hasChildren: true,
        virtualRow: {
            start: 0
        }
    }];

    let tree = convertPathsToTree({treeEntries: entries});
    expect(tree.length).toEqual(1);
    expect(tree[0].id).toEqual('/sites/testsite');
    expect(tree[0].children[0].id).toEqual('/sites/testsite/home');
    expect(tree[0].children[0].children[0].id).toEqual('/sites/testsite/home/about');
    expect(tree[0].children[0].children[0].children[0].id).toEqual('/sites/testsite/home/about/history');

    it('wraps only the matched substring of a matched entry\'s label, others untouched', () => {
        const withMatches = convertPathsToTree({treeEntries: entries, searchMatchedPaths: ['/sites/testsite/home/about'], searchTerm: 'bo'});
        const match = findInTree(withMatches, '/sites/testsite/home/about');
        const nonMatch = findInTree(withMatches, '/sites/testsite/home');

        expect(React.isValidElement(match.label)).toBe(true);
        expect(renderToStaticMarkup(match.label)).toBe('A<span class="searchMatchText">bo</span>ut');
        expect(nonMatch.label).toBe('Home');
    });

    it('highlights an accented label when searched with its unaccented spelling', () => {
        const accentedEntries = [...entries, {
            path: '/sites/testsite/home/cafe',
            node: {
                primaryNodeType: {
                    name: 'jnt:page'
                },
                displayName: 'Café'
            },
            hasChildren: false,
            virtualRow: {
                start: 0
            }
        }];

        const withMatches = convertPathsToTree({treeEntries: accentedEntries, searchMatchedPaths: ['/sites/testsite/home/cafe'], searchTerm: 'cafe'});
        const match = findInTree(withMatches, '/sites/testsite/home/cafe');

        expect(React.isValidElement(match.label)).toBe(true);
        expect(renderToStaticMarkup(match.label)).toBe('<span class="searchMatchText">Café</span>');
    });

    it('leaves the label as plain text when there is no active search', () => {
        const withoutMatches = convertPathsToTree({treeEntries: entries});
        const node = findInTree(withoutMatches, '/sites/testsite/home/about');

        expect(node.className).not.toMatch(/searchMatch/);
    });
});
