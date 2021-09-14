import org.jahia.services.categories.CategoryServiceImpl
import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate

import javax.jcr.RepositoryException
import javax.jcr.Value
import javax.jcr.ValueFactory

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, "default", Locale.ENGLISH, new JCRCallback<Object>() {
    @Override
    Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
        JCRNodeWrapper siteContent = session.getNode("/sites/SITEKEY/contents")
        JCRNodeWrapper siteFiles = session.getNode("/sites/SITEKEY/files")
        JCRNodeWrapper sitePageContent = session.getNode("/sites/SITEKEY/home")

        JCRNodeWrapper testContentFolder = siteContent.addNode("contentEditorTestContents", "jnt:contentFolder")
        JCRNodeWrapper testFilesFolder = siteFiles.addNode("contentEditorTestFiles", "jnt:folder")
        JCRNodeWrapper pickers = testContentFolder.addNode("contentEditorPickers", "qant:pickers")
        JCRNodeWrapper dateConstraintPickers = testContentFolder.addNode("contentEditorDateConstraintPickers", "qant:dateConstraint")
        JCRNodeWrapper allFields = testContentFolder.addNode("contentEditorAllFieldsSimple", "qant:allFields")
        allFields.setProperty("sharedSmallText", "Initial text")
        allFields.setProperty("sharedTextarea", "Initial text in textarea")

        JCRNodeWrapper serverSideConstraints = testContentFolder.addNode("ceServerSideConstraint", "qant:serverSideConstraint")
        JCRNodeWrapper allFieldsDefault = testContentFolder.addNode("contentEditorAllFieldsDefault", "qant:AllFieldsDefault")

        JCRNodeWrapper areaMain = sitePageContent.addNode("area-main", "jnt:contentList")
        JCRNodeWrapper simpleText = areaMain.addNode("simpleText", "jnt:text")
        simpleText.setProperty("text", "Initial simple text")

        JCRNodeWrapper contentListOrderingPage = sitePageContent.addNode("content-list-ordering-page", "jnt:page")
        contentListOrderingPage.setProperty("j:templateName", "simple")
        contentListOrderingPage.setProperty("jcr:title", "content-list-ordering-page")
        JCRNodeWrapper contentListOrdering = contentListOrderingPage.addNode("area-main", "jnt:contentList")
        JCRNodeWrapper simpleTextb = contentListOrdering.addNode("b", "jnt:text")
        simpleTextb.setProperty("text", "b")
        simpleTextb.setProperty("jcr:description", "3")
        JCRNodeWrapper simpleTextc = contentListOrdering.addNode("c", "jnt:text")
        simpleTextc.setProperty("text", "c")
        simpleTextc.setProperty("jcr:description", "1")
        JCRNodeWrapper simpleTexta = contentListOrdering.addNode("a", "jnt:text")
        simpleTexta.setProperty("text", "a")
        simpleTexta.setProperty("jcr:description", "2")

        JCRNodeWrapper simpleListWithoutSubNodes = testContentFolder.addNode("simpleListWithoutSubNode", "jnt:contentList")
        JCRNodeWrapper simpleListWithSubNodes = testContentFolder.addNode("simpleListWithSubNode", "jnt:contentList")
        JCRNodeWrapper subNodeText = simpleListWithSubNodes.addNode("testText", "jnt:text")
        subNodeText.setProperty("text", "test")
        JCRNodeWrapper protectedFields = testContentFolder.addNode("contentEditorProtectedFields", "qant:protectedFields")
        protectedFields.setProperty("protectedText", "protected text value")
        protectedFields.setProperty("protectedBigtext", "protected bigtext value")

        JCRNodeWrapper allFieldsMultiple = testContentFolder.addNode("contentEditorAllFieldsMultiple", "qant:allFieldsMultiple")
        allFieldsMultiple.setProperty("choicelist", ["choice1"] as String[])
        allFieldsMultiple.setProperty("sharedChoicelist", ["choice1"] as String[])

        JCRNodeWrapper allFieldsMultipleWithValues = testContentFolder.addNode("contentEditorAllFieldsMultipleWithValues", "qant:allFieldsMultiple")
        ValueFactory valueFactory = session.getValueFactory();
        allFieldsMultipleWithValues.setProperty("sharedChoicelist", [valueFactory.createValue("choice1")] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedSmallText", [valueFactory.createValue("test=1"), valueFactory.createValue("test=2")] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedTextarea", [valueFactory.createValue("value1"), valueFactory.createValue("value2")] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedLong", [valueFactory.createValue(1l), valueFactory.createValue(2l)] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedDouble", [valueFactory.createValue(1.1d), valueFactory.createValue(2.2d)] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedBoolean", [valueFactory.createValue(true), valueFactory.createValue(false)] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedDate", [valueFactory.createValue(new GregorianCalendar(2005, 1, 10, 14, 8, 56)),
                                                               valueFactory.createValue(new GregorianCalendar(1945, 1, 6, 16, 20, 0))] as Value[])
        allFieldsMultipleWithValues.setProperty("sharedDecimal", [valueFactory.createValue(1234567890.123456789)] as Value[])

        InputStream is = null
        try {
            if ("SITEKEY".startsWith("contentEditorTestSite2")) {
                is = new FileInputStream("SELENIUM_DOCUMENTS_PATH/jahiaChat.jpg")
                testFilesFolder.uploadFile("jahiaChat", is, "image/jpg")
            } else {
                is = new FileInputStream("SELENIUM_DOCUMENTS_PATH/paysage.jpg")
                testFilesFolder.uploadFile("paysage", is, "image/jpg")
            }
            session.save()
        } finally {
            is.close()
        }

        InputStream is2 = null
        try {
            is2 = new FileInputStream("SELENIUM_DOCUMENTS_PATH/photo.JPG")
            testFilesFolder.uploadFile("photo", is2, "image/jpg")
            session.save()
        } finally {
            is2.close()
        }

        JCRNodeWrapper imageReferenceLink = testContentFolder.addNode("contentEditorImageReferenceLink", "jnt:imageReferenceLink")
        JCRNodeWrapper imageReferenceLink2 = testContentFolder.addNode("contentEditorImageReferenceLink2", "jnt:imageReferenceLink")
        JCRNodeWrapper imageReferenceLink3 = testContentFolder.addNode("contentEditorImageReferenceLink3", "jnt:imageReferenceLink")

        JCRNodeWrapper imageNode
        if ("SITEKEY".startsWith("contentEditorTestSite2")) {
            imageNode = session.getNode("/sites/SITEKEY/files/contentEditorTestFiles/jahiaChat")
        } else {
            imageNode = session.getNode("/sites/SITEKEY/files/contentEditorTestFiles/paysage")
        }

        imageReferenceLink.setProperty("j:node", imageNode)
        imageReferenceLink.setProperty("j:linkType", "none")
        imageReferenceLink2.setProperty("j:node", imageNode)
        imageReferenceLink2.setProperty("j:linkType", "none")
        imageReferenceLink3.setProperty("j:node", imageNode)
        imageReferenceLink3.setProperty("j:linkType", "none")

        JCRNodeWrapper choiceLists = testContentFolder.addNode("contentEditorChoicelists", "qant:choicelist")
        choiceLists.setProperty("resourceBundle", "choice3")
        choiceLists.setProperty("country", "JO")
        choiceLists.setProperty("countryFlag", "GE")
        choiceLists.setProperty("j:linkType", "none")
        choiceLists.setProperty("j:linkTypeMultiple", [valueFactory.createValue("none")] as Value[])

        JCRNodeWrapper dependentChoiceLists = testContentFolder.addNode("ceDependentChoicelists", "qant:dependentChoicelist")
        dependentChoiceLists.setProperty("countryDep", "france")
        dependentChoiceLists.setProperty("regionDep", "ile-de-france")
        dependentChoiceLists.setProperty("cityDep", "paris")

        JCRNodeWrapper dependentChoiceListsMultiple = testContentFolder.addNode("ceDependentChoicelistsMulti", "qant:dependentChoicelistMultiple")
        dependentChoiceListsMultiple.setProperty("countryDep", [valueFactory.createValue("france")] as Value[])
        dependentChoiceListsMultiple.setProperty("regionDep", [valueFactory.createValue("ile-de-france")] as Value[])
        dependentChoiceListsMultiple.setProperty("cityDep", [valueFactory.createValue("paris")] as Value[])

        JCRNodeWrapper dynamicMixins = testContentFolder.addNode("contentEditorDynamicMixins", "qant:dynamicMixins")
        dynamicMixins.setProperty("selectMixin", "mixin1")

        JCRNodeWrapper constraints = testContentFolder.addNode("contentEditorConstraints", "qant:constraints")
        constraints.setProperty("mandatorySharedSmallText", "mandatoryValue")
        constraints.setProperty("mandatorySmallText", "mandatoryValue")
        constraints.setProperty("regexSharedSmallText", "a")
        constraints.setProperty("regexSmallText", "a")
        constraints.setProperty("mandatoryRegexSharedSmallText", "a")
        constraints.setProperty("mandatoryRegexSmallText", "a")

        JCRNodeWrapper contentFolderCreateTest = testContentFolder.addNode("contentEditorCreateMenuTest", "jnt:contentFolder");
        contentFolderCreateTest.addNode("simpleList", "jnt:contentList");
        JCRNodeWrapper contributeList = contentFolderCreateTest.addNode("simpleListWithContribution", "jnt:contentList");
        contributeList.addMixin("jmix:contributeMode");
        String[] types = ["jnt:text"];
        contributeList.setProperty("j:contributeTypes", types);
        contentFolderCreateTest.addNode("constraintList3", "qant:constraintList3");
        contentFolderCreateTest.addNode("constraintList4", "qant:constraintList4");

        //categories
        createCategory("cat1", session);
        createCategory("cat2", session);
        createCategory("cat3", session);

        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorAllFieldsSimple")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorPickers")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorDateConstraintPickers")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorProtectedFields")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorImageReferenceLink")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorChoicelists")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorAllFieldsMultiple")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorAllFieldsMultipleWithValues")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorConstraints")
        System.out.println("Created content: /sites/SITEKEY/contents/contentEditorTestContents/contentEditorAllFieldsDefault")

        session.save()
        return null
    }
})

def createCategory(String categoryName, session) {
    def categoryService = CategoryServiceImpl.getInstance()
    def rootCategory = categoryService.getCategoryByPath(categoryService.getCategoriesRoot().getPath());
    if (!session.nodeExists(rootCategory.getCategoryPath() + "/" + categoryName)) {
        categoryService.addCategory(categoryName, rootCategory);
    }
}
