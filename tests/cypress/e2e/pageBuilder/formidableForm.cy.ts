import {addNode, createSite, deleteSite, enableModule, getComponentByRole, Button} from '@jahia/cypress';
import {ContentEditor, JContent, JContentPageBuilder} from '../../page-object';

// Formidable is not part of the test environment, so the spec installs a published release
const installFormidable = `
- addMavenRepository: 'https://devtools.jahia.com/nexus/content/groups/public/@id=JahiaPublic'
- installBundle:
    - 'mvn:org.jahia.modules/formidable-engine/0.5.0'
    - 'js:mvn:org.jahia.modules/formidable-elements/0.5.0/tgz'
  autoStart: true
  uninstallPreviousVersion: true
`;

describe('Formidable form in the Page Builder', () => {
    const siteKey = 'formidableFormPageBuilder';
    const contentsPath = `/sites/${siteKey}/contents`;
    const formName = 'contact-form';
    const formPath = `${contentsPath}/${formName}`;
    const fieldPath = `${formPath}/fields/first-name`;

    // The Page Builder swaps two frames on a refresh, so each retry queries the active one again
    const frameFormShouldContain = (text: string) => {
        cy.get('iframe[data-sel-role="page-builder-frame-active"]').should($frame => {
            expect($frame.contents().find('form').text()).to.contain(text);
        });
    };

    const visitForm = (): JContent => {
        const jcontent = JContent.visit(siteKey, 'en', `content-folders/contents/${formName}`);
        jcontent.shouldBeInMode('Page Builder');
        new JContentPageBuilder(jcontent).getMainModule(formPath);
        return jcontent;
    };

    before(() => {
        cy.runProvisioningScript({script: {fileContent: installFormidable, type: 'application/yaml'}});
        createSite(siteKey);
        ['formidable-engine', 'formidable-elements'].forEach(moduleId => enableModule(moduleId, siteKey));
        addNode({
            parentPathOrId: contentsPath,
            name: formName,
            primaryNodeType: 'fmdb:form',
            properties: [{name: 'jcr:title', value: 'Contact form', language: 'en'}],
            children: [{
                name: 'fields',
                primaryNodeType: 'fmdb:fieldList',
                children: [
                    {name: 'first-name', primaryNodeType: 'fmdb:inputText', properties: [{name: 'jcr:title', value: 'First name', language: 'en'}]},
                    {name: 'email', primaryNodeType: 'fmdb:inputEmail', properties: [{name: 'jcr:title', value: 'Email', language: 'en'}]}
                ]
            }]
        });
    });

    after(() => {
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.loginAndStoreSession();
    });

    it('opens a form in the Page Builder when it is selected in the content tree', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.switchToListMode();
        jcontent.getTable().getRowByName(formName).should('be.visible');

        jcontent.getAccordionItem('content-folders').getTreeItem(formName).click();
        jcontent.shouldBeInMode('Page Builder');
        const pageBuilder = new JContentPageBuilder(jcontent);
        pageBuilder.getMainModule(formPath);
        pageBuilder.getModule(fieldPath).should('contain', 'First name');
    });

    it('edits a field of the form in the Page Builder', () => {
        const pageBuilder = new JContentPageBuilder(visitForm());
        pageBuilder.getModule(fieldPath).doubleClick();
        const contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('fmdb:inputText_jcr:title', false).addNewValue('Given name');
        contentEditor.save();
        frameFormShouldContain('Given name');
    });

    it('adds a field to the form from the Page Builder', () => {
        const jcontent = visitForm();
        new JContentPageBuilder(jcontent).iframe(true).get().find('[jahiatype="createbuttons"] .moonstone-button').contains('New Form field').click();
        jcontent.getCreateContent().getContentTypeSelector().searchForContentType('Text');
        jcontent.getCreateContent().getContentTypeSelector().selectContentType('fmdb:textarea').create();
        const contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('fmdb:textarea_jcr:title', false).addNewValue('Message');
        contentEditor.create();
        frameFormShouldContain('Message');
    });

    it('keeps the list view of a form reachable', () => {
        const jcontent = visitForm();
        jcontent.switchToListMode();
        jcontent.shouldBeInMode('List');
        jcontent.getTable().getRowByName('fields').should('be.visible');
    });

    it('returns a form from its list view to the Page Builder with Open in Page Builder', () => {
        // The action is in the menu of the narrow header, which shows at a header of 750px or less
        cy.viewport(1080, 768);
        const jcontent = visitForm();
        jcontent.switchToListMode();
        cy.get('button[data-sel-role="narrowHeaderMenu"]').should('be.visible').click();
        cy.get('#menuHolder .moonstone-menu:not(.moonstone-hidden) .moonstone-menuItem').contains('Open in Page Builder').click();
        jcontent.shouldBeInMode('Page Builder');
        new JContentPageBuilder(jcontent).getMainModule(formPath);
    });

    it('opens a new form in the Page Builder once it is created', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
        jcontent.switchToListMode();
        getComponentByRole(Button, 'createContent').click();
        jcontent.getCreateContent().getContentTypeSelector().searchForContentType('Form');
        jcontent.getCreateContent().getContentTypeSelector().selectContentType('fmdb:form').create();
        const contentEditor = new ContentEditor();
        contentEditor.getSmallTextField('fmdb:form_jcr:title', false).addNewValue('Newsletter');
        contentEditor.create();
        jcontent.shouldBeInMode('Page Builder');
        cy.url().should('contain', '/contents/newsletter');
        new JContentPageBuilder(jcontent).getMainModule(`${contentsPath}/newsletter`);
    });
});
