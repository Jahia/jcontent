import {JContent} from '../../../page-object';
import gql from 'graphql-tag';
import {PageComposer} from '../../../page-object/pageComposer';

describe('delete tests', () => {
    const siteKey = 'jContentSite-delete';

    before(() => {
        cy.executeGroovy('jcontent/createSite.groovy', {SITEKEY: siteKey});
        cy.apollo({mutationFile: 'jcontent/menuActions/createDeleteContent.graphql'});
    });

    beforeEach(() => {
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.executeGroovy('jcontent/deleteSite.groovy', {SITEKEY: siteKey});
        cy.logout();
    });

    const markForDeletionMutation = path => {
        return gql`mutation MarkForDeletionMutation {
            jcr { markNodeForDeletion(pathOrId: "${path}") }
        }`;
    };

    it('Can cancel mark for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="cancel-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can mark root and subnodes for deletion', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete 3 items, including 3 page(s)')
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify menu and subpages has been marked for deletion');
        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: `/sites/${siteKey}/home/test-pageDelete1`}
        }).should(resp => {
            const {mixinTypes, children} = resp?.data?.jcr.nodeByPath;
            expect(mixinTypes).to.not.be.empty;
            expect(mixinTypes.map(m => m.name)).to.include('jmix:markedForDeletion');
            expect(mixinTypes.map(m => m.name)).to.include('jmix:markedForDeletionRoot');

            // Verify all children have been marked for deletion
            const allMarkedForDeletion = children.nodes.every(n => {
                return n.mixinTypes.map(m => m.name).includes('jmix:markedForDeletion');
            });
            expect(allMarkedForDeletion).to.be.true;
        });
    });

    it('Cannot undelete non-root node', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Undelete non-root node');
        jcontent.getTable()
            .getRowByLabel('Subpage test 1')
            .contextMenu()
            .select('Undelete');

        cy.log('Verify dialog opens and cannot be marked for deletion');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'cannot currently be undeleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can undelete root node', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Undelete root node');
        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Undelete');

        cy.log('Verify dialog opens and can be undeleted');
        const dialogCss = '[data-sel-role="delete-undelete-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'Do you really want to undelete 3 items, including 3 page(s)')
            .find('[data-sel-role="delete-undelete-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify menu and subpages has been undeleted');
        cy.apollo({
            queryFile: 'jcontent/getMixinTypes.graphql',
            variables: {path: `/sites/${siteKey}/home/test-pageDelete1`}
        }).should(resp => {
            const {mixinTypes, children} = resp?.data?.jcr.nodeByPath;
            expect(mixinTypes).to.be.empty;
            expect(children.nodes.every(n => !n.mixinTypes.length)).to.be.true;
        });
    });

    it('It refreshes table and show notification when there is an error during deletion', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete');

        cy.log('Verify dialog opens and can be mark for deletion');
        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete 3 items, including 3 page(s)');

        cy.apollo({
            mutation: markForDeletionMutation(`/sites/${siteKey}/home/test-pageDelete1`)
        });

        cy.get(dialogCss).find('[data-sel-role="delete-mark-button"]').click();
        cy.get(dialogCss).should('not.exist');
        cy.contains('Could not perform the requested operation on selected content. Closing dialog and refreshing data.');
        cy.get('[role="alertdialog"]').find('button').click();
        cy.contains('[data-cm-role="table-content-list-row"]', 'Page test 1').first().as('pageTest1Row');
        cy.get('@pageTest1Row').find('[data-cm-role="publication-info"]').should('have.attr', 'data-cm-value', 'NOT_PUBLISHED').and('contain', 'Marked for deletion by root on ');
    });

    it('Cannot delete subnodes permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home/test-pageDelete1');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Cannot delete subnodes permanently');
        jcontent.getTable()
            .getRowByLabel('Subpage test 1')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and cannot be deleted permanently');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'cannot currently be deleted')
            .find('[data-sel-role="close-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
    });

    it('Can delete root node permanently', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Can delete root node permanently');
        jcontent.getTable()
            .getRowByLabel('Page test 1')
            .contextMenu()
            .select('Delete (permanently)');

        cy.log('Verify dialog opens and can be deleted');
        const dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete 3 items, including 3 page(s)')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');

        cy.log('Verify root node is deleted');
        cy.apollo({
            query: gql`query { jcr { nodeByPath(path: "/sites/${siteKey}/home/test-pageDelete1") {uuid}}}`,
            errorPolicy: 'ignore'
        }).should(resp => {
            expect(resp?.data.jcr.nodeByPath).to.be.null;
        });
        jcontent.checkSelectionCount(0);
    });

    it('show warning when content is referenced', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');

        jcontent.getTable()
            .getRowByLabel('test 3')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="cancel-button"]')
            .click();
        cy.contains('This item is currently referenced by other items.');
        cy.get(dialogCss).should('not.exist');
    });

    it('shows usages button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');

        jcontent.getTable()
            .getRowByLabel('test 3')
            .contextMenu()
            .select('Delete');

        cy.get('[data-sel-role="delete-mark-dialog"]').contains('1 usage').click();
        cy.get('[data-sel-role="usages-table"]').as('usagesTable').should('contain', 'test-delete3-ref').and('contain', 'Content reference');
        cy.get('@usagesTable').find('button[data-sel-role="close"]').click();
    });

    it('Shows export button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        jcontent.getTable()
            .getRowByLabel('Page test 2')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="exportPage"]');
    });

    it('Shows download zip button', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'media/files');
        jcontent.switchToListMode();
        jcontent.getTable()
            .getRowByLabel('test-folderDelete1')
            .contextMenu()
            .select('Delete');

        const dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .find('[data-sel-role="downloadAsZip"]');
    });

    it('Can delete root node permanently and refresh selection', () => {
        const jcontent = JContent.visit(siteKey, 'en', 'pages/home');
        jcontent.switchToListMode();
        jcontent.switchToSubpages();

        cy.log('Can delete root node permanently');
        jcontent.getTable()
            .selectRowByLabel('Page test 2');

        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('delete').click();
        cy.log('Verify dialog opens and can be deleted');
        let dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete Page test 2')
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('deletePermanently').click();
        cy.log('Verify dialog opens and can be deleted');
        dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete Page test 2')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(0);
    });

    it('Delete permanently a newly created content folder and clear selection', function () {
        const jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents/test-deleteContents');
        jcontent.getAccordionItem('content-folders').expandTreeItem('test-deleteContents');
        jcontent.getHeaderActionButton('createContentFolder').click();
        cy.get('#folder-name').type('test-parent-folder');
        cy.get('[data-cm-role="create-folder-as-confirm"]').click();
        jcontent.getAccordionItem('content-folders').getTreeItem('test-parent-folder').should('be.visible').click();
        jcontent.getHeaderActionButton('createContentFolder').click();
        cy.get('#folder-name').type('Soon to be deleted');
        cy.get('[data-cm-role="create-folder-as-confirm"]').click();
        jcontent.getTable().selectRowByLabel('Soon to be deleted');
        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('delete').click();
        cy.log('Verify dialog opens and can be deleted');
        let dialogCss = '[data-sel-role="delete-mark-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to delete Soon to be deleted')
            .find('[data-sel-role="delete-mark-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(1);
        jcontent.getHeaderActionButton('deletePermanently').click();
        cy.log('Verify dialog opens and can be deleted');
        dialogCss = '[data-sel-role="delete-permanently-dialog"]';
        cy.get(dialogCss)
            .should('contain', 'You are about to permanently delete Soon to be deleted')
            .find('[data-sel-role="delete-permanently-button"]')
            .click();
        cy.get(dialogCss).should('not.exist');
        jcontent.checkSelectionCount(0);
    });

    describe.only('Legacy Page Composer GWT Tests', () => {
        const text = 'Cercarla inquieta ne ed bruttava scarabeo ostinata su so. Guardava volgersi la va pensieri ho. Imagina in ritorni sa calmati fuggire al ed sorrisi. Ha impudente riaprirmi la la ascoltami sorridere subitaneo vivamente vi. Promessa lo va palpebre ho me riposati provarlo. Turba ben tenue all hai rende osate porre nei volge. Osi sfaldavano dolcemente trascinava sii dio eguagliare chiedergli conservava qui. Esausto tal calmati uno portate qui sognato sta baciato. Con sta armi era gote ambo pur.\n' +
            '\n' +
            'Riparo specie non calice dal volevo eroico mia. Oh care io ai vivo vedo tu onde. Parlero rimorso ho abbozzo ma conduco ex dovesti. Il inespresso si perpetuato palpitante emergevano. Prende sia sentii potrei vedevo mia ama all. Fai incontrato dolcemente lei del tra calpestare avidamente.\n' +
            '\n' +
            'Chi splendori ero per singolare rifiutare. Stia alpe si nato di ci dara. Ti un ha voglio fu vicino volevo stoffe aperta voluto. Credetti io no spezzare va re prodigio. Fina dell ebro bell oro file afa. Sepolcri ti vergogna ci torrente. Voi bestiale dio turbarlo sul lasciati talvolta stillano bastanza.\n' +
            '\n' +
            'Annunziare pericolosa pensieroso ad ma. Vuoi acre fine pago bel tua una. Ma solo rose ch ardi rote reni. Capolavoro or ed da cancellata oricellari interrompe ah. Amo nel sorriso polvere non liberta. Scompare profonda di lucidita ah possente duchessa. Com capo ore per cima ella atto voto mia tele.\n' +
            '\n' +
            'Ha ma anima lotta farla umida brevi mirti di. Spero col del the sai lauro dolce getto. Ci piramide bestiale raccogli smettere ci filaccie ho ah. Compiuto sofferma di vi sospenda. Ed lo scale rosse degli colte grado so di. Fu accaduto serbatoi montagne io se giardini me finestre cipresso. Trascinano preferisti in no el cancellato ai. Prendesse se vigilanza mazzolino vi deliziosa dissetato. Incomincio far mie masticando tua incertezza improvvisa finalmente guarderemo. Se stelle altera sedere il verita venuto il ultima.\n' +
            '\n' +
            'Nuvola ed fa potuto di tracce infine me. Semplice miracolo col dal proseguo cipressi una. Assorto pregato giu portero ali chinava eri. Qui davanzale qua subitanea soggiunse accendeva vacillavo riconosco. Udito il oblio amano anche degna acuta ha. Uno divina giu qua sangue furore barche quante nel.\n' +
            '\n' +
            'Lo in ti splendore solitario io generando. Mentre povero allora ve gioghi posata depone ma re da. Smarrisce po vigilanza ho ornamento tentativo. Cima vede soli dove vada meno sul dio. Piena bosco copre fanno siedi due qui chi. Or evocata va braccio intatta vi vi. Campo ero corse pensa sta assai ferro era. Ove tabacco ben mia vedesti evitato diventi attende noi versate. Vibri amo tra prima sai eri verso.\n' +
            '\n' +
            'Tempesta tue qualcuno scolpita tua montagne. Ammirabile elefantina nascondeva accompagno accostarmi la vi fa discendere me. Vai oro inquieta sua sussulto soltanto amo. Vale lo da fare sara veda po faro quel. Implorando io rinnovella ah discendere incomincio le. Le ghirlande usignuoli tenerezza dimagrato primavera da so ha. Incomincio sospettoso affrontare un ah declinante villanella lievissimo. Percosso continua prodigio chiamata escirgli ah tu lucidita. Intendeva per statuette singolare bel guanciale sta mio smarrisce tristezza. Fossi un tante or spera.\n' +
            '\n' +
            'Parrebbe osi volgendo traversa poi torcesse esercita. Gocce messa tua sue offro. Da svanito piccolo leggera perisce avevano le modella fu ha. Anno fu me bene un orlo onta volo ai tese. Conoscermi di indefinite cominciata seducevano coraggiose sgomentato si. Per rientrarvi sfaldavano sostenendo ore. Te da coraggio tendendo silenzio da. Obliare corrosi confini pollici ve al deposti monella.\n' +
            '\n' +
            'Brillanti sostenere riempiono sublimate fu da. Ho sofferma al so compiere stillano. Perche me furore povero ti vostri no vi. Riconobbe sparvieri salutando lo ritornata tu precipita. Il parlato battera augusta lontano miseria sa. Dove fai ero doni teco sua alpe sul solo. Vuotarla ad gioconda ch ripeteva conservo turbarlo. Un so anch io pace taci cane nego rete.';

        let pageComposer: PageComposer;
        before(() => {
            cy.apollo({mutationFile: 'jcontent/enableLegacyPageComposer.graphql'});
            cy.executeGroovy('contentEditor/createSiteI18N.groovy', {SITEKEY: 'deleteInLegacy'});
        });
        beforeEach(() => {
            cy.loginAndStoreSession();
            pageComposer = PageComposer.visit('deleteInLegacy', 'en', 'home.html');
        });
        after(function () {
            cy.logout();
            cy.executeGroovy('contentEditor/deleteSite.groovy', {SITEKEY: 'deleteInLegacy'});
        });
        it('opens JContent delete dialog in legacy', () => {
            const contentEditor = pageComposer
                .openCreateContent()
                .getContentTypeSelector()
                .searchForContentType('Rich text')
                .selectContentType('Rich text')
                .create();
            contentEditor.getRichTextField('jnt:bigText_text').setData(text)
            contentEditor.create()
            pageComposer.refresh()
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeleteDialog()
            let dialogCss = '[data-sel-role="delete-mark-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-mark-button"]')
                .click();
            pageComposer.refresh()
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openUndeleteDialog()
            dialogCss = '[data-sel-role="delete-undelete-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-undelete-button"]')
                .click();
            pageComposer.refresh()
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeleteDialog()
            dialogCss = '[data-sel-role="delete-mark-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-mark-button"]').should('be.visible')
                .click();
            pageComposer.openContextualMenuOnContent('div[path="/sites/deleteInLegacy/home/area-main/rich-text"]').openDeletePermanentlyDialog()
            dialogCss = '[data-sel-role="delete-permanently-dialog"]';
            cy.get(dialogCss)
                .should('be.visible')
                .find('[data-sel-role="delete-permanently-button"]')
                .click();
        })
    });
});
