import React from 'react';
import {File, FolderSpecial, Collections} from '@jahia/moonstone/dist/icons';
import {shallow} from '@jahia/test-framework';
import ContentNavigation from './ContentNavigation';
import JContentConstants from '../../JContent.constants';
import {Accordion, AccordionItem} from '@jahia/moonstone';

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
                defaultPath: siteKey => '/sites/' + siteKey,
                render: () => (
                    <div>Pages</div>
                )
            },
            {
                key: JContentConstants.mode.CONTENT_FOLDERS,
                icon: <FolderSpecial/>,
                label: 'label.contentManager.navigation.contentFolders',
                defaultPath: siteKey => '/sites/' + siteKey + '/contents',
                render: () => (
                    <div>Content Folders</div>
                )
            },
            {
                key: JContentConstants.mode.MEDIA,
                icon: <Collections/>,
                label: 'label.contentManager.navigation.media',
                defaultPath: siteKey => '/sites/' + siteKey + '/files',
                render: () => (
                    <div>Files</div>
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
