import {contentTypes} from '../../fixtures/contentEditor/pickers/contentTypes';
import gql from 'graphql-tag';
import {JContent} from '../../page-object/jcontent';
import {SecondaryNav} from '@jahia/cypress';

interface TreeQueryOp {
    operationName?: string;
    variables?: {
        openPaths?: string[];
    };
}

// Records the open paths of each tree query from now on. Apollo batches operations, and the tree query is renamed after the fragments it carries
const watchTreeQueries = (): string[][] => {
    const treeQueries: string[][] = [];
    cy.intercept('POST', '**/modules/graphql', req => {
        treeQueries.push(...(Array.isArray(req.body) ? req.body : [req.body])
            .filter((op: TreeQueryOp) => op?.operationName?.startsWith('PickerQuery'))
            .map((op: TreeQueryOp) => op.variables?.openPaths || []));
    });
    return treeQueries;
};

// The last tree query carries the paths that the picker left open once it showed the selection
const assertLastTreeQueryOpens = (treeQueries: string[][], openedPath: string, closedPaths: string[]) => {
    cy.wrap(treeQueries).should(queries => {
        const openPaths = queries[queries.length - 1];
        expect(openPaths).to.include(openedPath);
        closedPaths.forEach(path => expect(openPaths).not.to.include(path));
    });
};

describe('Picker - Editorial link', {testIsolation: false}, () => {
    const siteKey = 'digitall';
    let jcontent: JContent;

    // Helper

    const createNavText = () => {
        // Verify nav text is displayed
        cy.apollo({mutation: gql`
                mutation addNavText {
                    jcr {
                        mutateNode(pathOrId: "/sites/digitall/home/about") {
                            addChild(name: "navMenuText", primaryNodeType: "jnt:navMenuText", properties: [
                                { name: "jcr:title", language: "en", value: "navMenuText" }
                            ]) {uuid}
                        }
                    }
                }
            `});
        cy.apollo({mutationFile: 'contentEditor/pickers/createMainResources.graphql'});
    };

    const deleteNavText = () => {
        cy.apollo({mutation: gql`
                mutation deleteNavText {
                    jcr {
                        content: deleteNode(pathOrId: "/sites/digitall/home/about/navMenuText")
                        content2: deleteNode(pathOrId: "/sites/digitall/contents/article")
                    }
                }
            `});
    };

    // Setup

    before(() => {
        createNavText();
    });

    beforeEach(() => {
        cy.login();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    after(() => {
        deleteNavText();
        cy.logout();
    });

    it('should display editorial link picker', () => {
        const contentType = contentTypes.editoriallinkpicker;
        const contentEditor = jcontent.createContent(contentType.typeName);
        const picker = contentEditor
            .getPickerField(contentType.fieldNodeType, contentType.multiple)
            .open();
        picker.wait();

        picker.getSiteSwitcher().should('be.visible');

        cy.log('Verify tabs');
        picker.getTab('content')
            .should('be.visible');
        picker.getTab('pages')
            .should('be.visible')
            .and('have.class', 'moonstone-tabItem_selected'); // Default selected

        // Select pages tab; verify types
        cy.log('Verify content types in pages tab');
        picker
            .getTable()
            .getRows()
            .get()
            .find('[data-cm-role="table-content-list-cell-type"]')
            .should(elems => {
                const texts = elems.get().map(e => e.textContent);
                const allTypes = texts.sort().filter((f, i) => texts.indexOf(f) === i);
                expect(allTypes).to.contain('Page');
            });

        // Select content tab; verify types
        cy.log('Verify content types in content tab');
        picker.selectTab('content');
        picker
            .getTable()
            .getRows()
            .get()
            .find('[data-cm-role="table-content-list-cell-type"]')
            .should(elems => {
                const texts = elems.get().map(e => e.textContent);
                const allTypes = texts.sort().every(content => ['Content Folder', 'Person portrait', 'Article (title and introduction)'].includes(content));
                expect(allTypes).to.be.true;
            });

        // Verify whole left nav is gone
        picker.get().find(SecondaryNav.defaultSelector, {timeout: 2000}).should('not.exist');

        picker.cancel();
        contentEditor.cancel();
    });

    it('should expand selection and restore tab', () => {
        const contentType = contentTypes.editoriallinkpicker;
        const contentEditor = jcontent.createContent(contentType.typeName);
        const pickerField = contentEditor
            .getPickerField(contentType.fieldNodeType, contentType.multiple);
        const picker = pickerField
            .open();

        cy.log('select newsroom > news-entry > all organic in pages tab');
        picker.selectTab('pages');
        picker.getTable().getRowByName('newsroom').get().scrollIntoView();
        picker.getTable().getRowByName('newsroom').expand();
        picker.getTable().getRowByName('news-entry').expand().should('be.visible');
        picker.getTable().getRowByName('all-organic-foods-network-gains').should('be.visible').click();

        picker.selectTab('content'); // Switch tabs
        picker.select();

        pickerField.assertValue('all-Organic Foods Network Gains New Sponsorship');

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);

        const newsEntry = '/sites/digitall/home/newsroom/news-entry';
        const newsArea = `${newsEntry}/article`;
        const verifySelectionIsExpanded = () => {
            picker.getTab('pages').should('have.class', 'moonstone-tabItem_selected');
            picker.getTable().getRowByName('all-organic-foods-network-gains').get().scrollIntoView();
            picker.getTable().getRowByName('all-organic-foods-network-gains')
                .should('be.visible') // Expanded
                .and('have.class', 'moonstone-TableRow-highlighted'); // Selected
        };

        cy.log('verify tab is restored and selection is expanded');
        const reopenQueries = watchTreeQueries();
        pickerField.open();
        verifySelectionIsExpanded();

        cy.log('verify the area that holds the news is not opened, as the page already lists its content');
        assertLastTreeQueryOpens(reopenQueries, newsEntry, [newsArea]);
        picker.cancel();

        cy.log('pick an image, which leaves the picker on the media accordion');
        const imageField = contentEditor.getPickerField(contentTypes.imagepicker.fieldNodeType, contentTypes.imagepicker.multiple);
        const mediaPicker = imageField.open();
        const mediaAccordion = mediaPicker.getAccordionItem('picker-media');
        mediaPicker.navigateTo(mediaAccordion, 'files/images/backgrounds');
        mediaPicker.getGrid().getCardByName('fans-stadium.jpg').click();
        mediaPicker.select();
        imageField.assertValue('fans-stadium.jpg');

        cy.log('verify the link still opens only the ancestors of its selection, and none of the image folders');
        const afterImageQueries = watchTreeQueries();
        pickerField.open();
        verifySelectionIsExpanded();
        assertLastTreeQueryOpens(afterImageQueries, newsEntry, [newsArea, '/sites/digitall/files/images']);
        picker.cancel();
        contentEditor.cancelAndDiscard();
    });

    it('can select main resource and sub-main resource', () => {
        const contentType = contentTypes.editoriallinkpicker;
        const contentEditor = jcontent.createContent(contentType.typeName);
        const pickerField = contentEditor
            .getPickerField(contentType.fieldNodeType, contentType.multiple);
        const picker = pickerField.open();

        picker.selectTab('content');

        picker.getTable().getRowByName('article').get().scrollIntoView();
        picker.getTable().getRowByName('article').expand();
        picker.getTable().getRowByName('paragraph').should('be.visible').click();
        picker.select();

        cy.log('verify the main resource that holds the selection is expanded');
        pickerField.open();
        picker.getTab('content').should('have.class', 'moonstone-tabItem_selected');
        picker.getTable().getRowByName('paragraph').get().scrollIntoView();
        picker.getTable().getRowByName('paragraph')
            .should('be.visible')
            .and('have.class', 'moonstone-TableRow-highlighted');
        picker.cancel();

        contentEditor.cancelAndDiscard();
    });
});
