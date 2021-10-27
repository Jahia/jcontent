import {convertPathsToTree, findInTree, getParentPath} from './ContentTree.utils';

describe('getParentPath', () => {
    it('should return parent path', () => {
        expect(getParentPath('/sites/testsite/home')).toEqual('/sites/testsite');
        expect(getParentPath('/sites/testsite/home/about')).toEqual('/sites/testsite/home');
        expect(getParentPath('/sites/testsite')).toEqual('/sites');
        expect(getParentPath('/a/b/c/d')).toEqual('/a/b/c');
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
        hasChildren: true
    }, {
        path: '/sites/testsite/home',
        node: {
            primaryNodeType: {
                name: 'jnt:page'
            },
            displayName: 'Home'
        },
        hasChildren: true
    }, {
        path: '/sites/testsite/home/about',
        node: {
            primaryNodeType: {
                name: 'jnt:page'
            },
            displayName: 'About'
        },
        hasChildren: true
    }, {
        path: '/sites/testsite/home/about/history',
        node: {
            primaryNodeType: {
                name: 'jnt:page'
            },
            displayName: 'History'
        },
        hasChildren: true
    }];

    let tree = convertPathsToTree(entries);
    expect(tree.length).toEqual(1);
    expect(tree[0].id).toEqual('/sites/testsite');
    expect(tree[0].children[0].id).toEqual('/sites/testsite/home');
    expect(tree[0].children[0].children[0].id).toEqual('/sites/testsite/home/about');
    expect(tree[0].children[0].children[0].children[0].id).toEqual('/sites/testsite/home/about/history');
});
