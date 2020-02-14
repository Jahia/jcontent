import React from 'react';
import {shallow} from '@jahia/test-framework';
import {Breadcrumb} from './Breadcrumb';
import JContentConstants from '../../JContent.constants';

let breadcrumbs1 = [
    {
        path: '/sites/digitall/contents',
        name: 'Browse Folders',
        type: 'jnt:contentFolder',
        uuid: 'fb3bdb25-b31a-4ca9-86f5-0e3f02dd165d'
    },
    {
        path: '/sites/digitall/contents/folderA',
        name: 'folderA',
        type: 'jnt:contentFolder',
        uuid: '1a3a86b8-3fad-48a8-be41-b2b79f2985c1'
    },
    {
        path: '/sites/digitall/contents/folderA/folderB',
        name: 'folderB',
        type: 'jnt:contentFolder',
        uuid: '117c5985-4be4-4a3a-ba67-190200377f61'
    },
    {
        path: '/sites/digitall/contents/folderA/folderB/folderC',
        name: 'folderC',
        type: 'jnt:contentFolder',
        uuid: '136ce755-7b02-489b-8ef8-28574ce30d59'
    }
];

let breadcrumbs2 = [
    {
        path: '/sites/digitall/contents',
        name: 'Browse Folders',
        type: 'jnt:contentFolder',
        uuid: 'fb3bdb25-b31a-4ca9-86f5-0e3f02dd165d'
    },
    {
        path: '/sites/digitall/contents/folderA',
        name: 'folderA',
        type: 'jnt:contentFolder',
        uuid: '1a3a86b8-3fad-48a8-be41-b2b79f2985c1'
    },
    {
        path: '/sites/digitall/contents/folderA/folderB',
        name: 'folderB',
        type: 'jnt:contentFolder',
        uuid: '117c5985-4be4-4a3a-ba67-190200377f61'
    },
    {
        path: '/sites/digitall/contents/folderA/folderB/folderC',
        name: 'folderC',
        type: 'jnt:contentFolder',
        uuid: '136ce755-7b02-489b-8ef8-28574ce30d59'
    },
    {
        path: '/sites/digitall/contents/folderA/folderB/folderC/folderD',
        name: 'folderD',
        type: 'jnt:contentFolder',
        uuid: '117c5985-4be4-4a3a-ba67-190200377f81'
    },
    {
        path: '/sites/digitall/contents/folderA/folderB/folderD/area',
        name: 'area1',
        type: 'jnt:contentList',
        uuid: '136ce755-7b02-489b-8ef8-28574ce30d59'
    }
];

describe('breadcrumb with 3 levels', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                classes: {},
                breadcrumbs: breadcrumbs1,
                mode: JContentConstants.mode.CONTENT_FOLDERS,
                path: '/folderA/folderB/folderC',
                selectItem: jest.fn()
            };

            wrapper = shallow(<Breadcrumb {...props}/>);
        } catch (e) {
            console.log(e);
        }
    });

    it('render', async () => {
        expect(wrapper.find('WithStyles(BreadcrumbItem)').length).toBe(4);
    });

    it('should render Browse breadcrumb first', async () => {
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(0).props().item.name).toBe('Browse Folders');
    });

    it('should render the items in the right order', async () => {
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(1).props().item.name).toBe('folderA');
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(2).props().item.name).toBe('folderB');
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(3).props().item.name).toBe('folderC');
    });
});

describe('breadcrumb with many levels', () => {
    let props;
    let wrapper;

    beforeEach(() => {
        try {
            props = {
                classes: {},
                breadcrumbs: breadcrumbs2,
                mode: JContentConstants.mode.CONTENT_FOLDERS,
                path: '/folderA/folderB/folderC/folderD/area',
                selectItem: jest.fn()
            };

            wrapper = shallow(<Breadcrumb {...props}/>);
        } catch (e) {
            console.log(e);
        }
    });

    it('render', async () => {
        expect(wrapper.find('WithStyles(BreadcrumbItem)').length).toBe(3);
        expect(wrapper.find('WithStyles(BreadcrumbHiddenItems)').length).toBe(1);
        expect(wrapper.find('WithStyles(BreadcrumbHiddenItems)').at(0).props().hidden.length).toBe(3);
    });

    it('should render Browse breadcrumb first', async () => {
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(0).props().item.name).toBe('Browse Folders');
    });

    it('should render the items in the right order', async () => {
        expect(wrapper.find('WithStyles(BreadcrumbHiddenItems)').at(0).props().hidden[0].name).toBe('folderA');
        expect(wrapper.find('WithStyles(BreadcrumbHiddenItems)').at(0).props().hidden[1].name).toBe('folderB');
        expect(wrapper.find('WithStyles(BreadcrumbHiddenItems)').at(0).props().hidden[2].name).toBe('folderC');
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(1).props().item.name).toBe('folderD');
        expect(wrapper.find('WithStyles(BreadcrumbItem)').at(2).props().item.name).toBe('area1');
    });
});

