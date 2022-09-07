import React from 'react';
import {Accordion, AccordionItem, Collections, File, FolderSpecial} from '@jahia/moonstone';
import {shallow} from '@jahia/test-framework';
import ContentNavigation from './ContentNavigation';
import JContentConstants from '../JContent.constants';

jest.mock('./NavigationHeader');

describe('Accordion with 3 accordion items', () => {
    let wrapper;

    let props = {
        mode: JContentConstants.mode.PAGES,
        accordionItems: [
            {
                key: JContentConstants.mode.PAGES,
                icon: <File/>,
                label: 'label.contentManager.navigation.pages',
                rootPath: '/sites/{site}',
                render: v => (
                    <AccordionItem key={v.id} id={v.id} label={v.label}><div>Pages</div></AccordionItem>
                )
            },
            {
                key: JContentConstants.mode.CONTENT_FOLDERS,
                icon: <FolderSpecial/>,
                label: 'label.contentManager.navigation.contentFolders',
                rootPath: '/sites/{site}/contents',
                render: v => (
                    <AccordionItem key={v.id} id={v.id} label={v.label}><div>Content Folders</div></AccordionItem>
                )
            },
            {
                key: JContentConstants.mode.MEDIA,
                icon: <Collections/>,
                label: 'label.contentManager.navigation.media',
                rootPath: '/sites/{site}/files',
                render: v => (
                    <AccordionItem key={v.id} id={v.id} label={v.label}><div>Files</div></AccordionItem>
                )
            }
        ],
        siteKey: 'testSite',
        handleNavigation: (accordionKey, defaultUrl) => {
            console.log(accordionKey);
            console.log(defaultUrl);
        }
    };

    beforeAll(() => {
        wrapper = shallow(<ContentNavigation {...props}/>);
    });

    it('Should render', async () => {
        expect(wrapper.find(Accordion)).toHaveLength(1);
        expect(wrapper.find(AccordionItem)).toHaveLength(3);
    });

    it('First accordion item should be opened', async () => {
        expect(wrapper.find(AccordionItem).at(0).contains(<div>Pages</div>)).toBe(true);
    });

    it('Second and Third accordion item should be closed', async () => {
        expect(wrapper.find(AccordionItem).at(1).contains(<div>Content Folders</div>)).toBe(true);
        expect(wrapper.find(AccordionItem).at(2).contains(<div>Media</div>)).toBe(false);
    });
});
