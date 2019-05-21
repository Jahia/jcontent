import React from 'react';
import {mount, shallow} from '@jahia/test-framework';
import {buildBreadcrumbItems} from './Breadcrumb.utils';


let data = {
    jcr: {
        nodeByPath: {
            uuid: '136ce755-7b02-489b-8ef8-28574ce30d59',
            displayName: 'area1',
            primaryNodeType: {
                name: 'jnt:contentList',
                __typename: 'JCRNodeType'
            },
            ancestors: [
                {
                    uuid: 'fb3bdb25-b31a-4ca9-86f5-0e3f02dd165d',
                    path: '/sites/digitall/contents',
                    displayName: 'contents',
                    type: {
                        name: 'jnt:contentFolder',
                        __typename: 'JCRNodeType'
                    },
                    __typename: 'GenericJCRNode'
                },
                {
                    uuid: '1a3a86b8-3fad-48a8-be41-b2b79f2985c1',
                    path: '/sites/digitall/contents/folderA',
                    displayName: 'folderA',
                    type: {
                        name: 'jnt:contentFolder',
                        __typename: 'JCRNodeType'
                    },
                    __typename: 'GenericJCRNode'
                },
                {
                    uuid: '117c5985-4be4-4a3a-ba67-190200377f61',
                    path: '/sites/digitall/contents/folderA/folderB',
                    displayName: 'folderB',
                    type: {
                        name: 'jnt:contentFolder',
                        __typename: 'JCRNodeType'
                    },
                    __typename: 'GenericJCRNode'
                },
                {
                    uuid: '136ce755-7b02-489b-8ef8-28574ce30d59',
                    path: '/sites/digitall/contents/folderA/folderB/folderC',
                    displayName: 'folderC',
                    type: {
                        name: 'jnt:contentFolder',
                        __typename: 'JCRNodeType'
                    },
                    __typename: 'GenericJCRNode'
                },
                {
                    uuid: 'b946066b-5927-4aca-8cc7-e27275547283',
                    path: '/sites/digitall/contents/folderA/folderB/folderC/folderD',
                    displayName: 'folderD',
                    type: {
                        name: 'jnt:contentFolder',
                        __typename: 'JCRNodeType'
                    },
                    __typename: 'GenericJCRNode'
                }
            ],
            workspace: 'EDIT',
            path: '/sites/digitall/contents/folderA/folderB/folderC/folderD/area',
            __typename: 'GenericJCRNode'
        },
        __typename: 'JCRQuery'
    }
};

describe('build breadcrumb test', () => {
     let items = buildBreadcrumbItems('/sites/digitall/contents/folderA/folderB/folderC/folderD/area', data, "browse", () => "Browse Folders", "digitall");

     it('should build the right breadcrumb object', () => {
         expect(items.length).toBe(6);
         expect(items[0]).toEqual({
             path: '/sites/digitall/contents',
             name: 'Browse Folders',
             type: 'jnt:contentFolder',
             uuid: 'fb3bdb25-b31a-4ca9-86f5-0e3f02dd165d'
         });

         expect(items[1]).toEqual({
             path: '/sites/digitall/contents/folderA',
             name: 'folderA',
             type: 'jnt:contentFolder',
             uuid: '1a3a86b8-3fad-48a8-be41-b2b79f2985c1'
         });

         expect(items[2]).toEqual({
             path: '/sites/digitall/contents/folderA/folderB',
             name: 'folderB',
             type: 'jnt:contentFolder',
             uuid: '117c5985-4be4-4a3a-ba67-190200377f61'
         });

         expect(items[3]).toEqual({
             path: '/sites/digitall/contents/folderA/folderB/folderC',
             name: 'folderC',
             type: 'jnt:contentFolder',
             uuid: '136ce755-7b02-489b-8ef8-28574ce30d59'
         });

         expect(items[4]).toEqual({
             path: '/sites/digitall/contents/folderA/folderB/folderC/folderD',
             name: 'folderD',
             type: 'jnt:contentFolder',
             uuid: 'b946066b-5927-4aca-8cc7-e27275547283'
         });

         expect(items[5]).toEqual({
             path: '/sites/digitall/contents/folderA/folderB/folderC/folderD/area',
             name: 'area1',
             type: 'jnt:contentList',
             uuid: '136ce755-7b02-489b-8ef8-28574ce30d59'
         });
     });
});

