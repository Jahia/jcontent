interface ContentTypes {
    [key: string]: ContentType
}

/*
 *  - typeName: Content type to search for when adding content; case sensitive
 *  - fieldNodeType: content type field to open picker with; corresponds with 'data-sel-content-editor-field' attr
 */
interface ContentType {
    typeName: string
    fieldNodeType: string
    multiple: boolean
}

const contentTypes: ContentTypes = {
    contentReference: {
        typeName: 'jnt:contentReference',
        fieldNodeType: 'jnt:contentReference_j:node',
        multiple: false
    },
    fileReference: {
        typeName: 'jnt:fileReference',
        fieldNodeType: 'jnt:fileReference_j:node',
        multiple: false
    },
    imageReference: {
        typeName: 'jnt:imageReferenceLink',
        fieldNodeType: 'jnt:imageReferenceLink_j:node',
        multiple: false
    },
    // From qa-module
    fileMultipleReference: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_imagepicker',
        multiple: true
    },
    filepicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_filepicker',
        multiple: false
    },
    imagepicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_imagepicker',
        multiple: false
    },
    folderpicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_folderpicker',
        multiple: false
    },
    contentfolderpicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_contentfolderpicker',
        multiple: false
    },
    portletpicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_portletpicker',
        multiple: false
    },
    editorialpicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_editorialpicker',
        multiple: false
    },
    editoriallinkpicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_editoriallinkpicker',
        multiple: false
    },
    categorypicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_categorypicker',
        multiple: false
    },
    sitepicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_sitepicker',
        multiple: false
    },
    userpicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_userpicker',
        multiple: false
    },
    usergrouppicker: {
        typeName: 'qant:pickers',
        fieldNodeType: 'qant:pickers_usergrouppicker',
        multiple: false
    },
    filepickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_filepicker',
        multiple: false
    },
    imagepickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_imagepicker',
        multiple: false
    },
    folderpickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_folderpicker',
        multiple: false
    },
    contentfolderpickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_contentfolderpicker',
        multiple: false
    },
    portletpickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_portletpicker',
        multiple: false
    },
    editorialpickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_editorialpicker',
        multiple: false
    },
    editoriallinkpickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_editoriallinkpicker',
        multiple: false
    },
    categorypickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_categorypicker',
        multiple: false
    },
    sitepickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_sitepicker',
        multiple: false
    },
    userpickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_userpicker',
        multiple: false
    },
    usergrouppickerMultiple: {
        typeName: 'qant:pickersMultiple',
        fieldNodeType: 'qant:pickersMultiple_usergrouppicker',
        multiple: false
    },
    customPicker: {
        typeName: 'qant:customPicker',
        fieldNodeType: 'qant:customPicker_myCategoryPicker',
        multiple: false
    },
    pickerWithOverride: {
        typeName: 'qant:customPicker',
        fieldNodeType: 'qant:customPicker_myOverridenEditorialPicker',
        multiple: false
    },
    pageDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_page',
        multiple: false
    },
    contentfolderDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_contentFolder',
        multiple: false
    },
    folderDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_folder',
        multiple: false
    },
    fileDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_file',
        multiple: false
    },
    imageDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_image',
        multiple: false
    },
    editoriallinkDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_editoriallink',
        multiple: false
    },
    userDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_user',
        multiple: false
    },
    usergroupDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_usergroup',
        multiple: false
    },
    siteDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_site',
        multiple: false
    },
    categoryDefault: {
        typeName: 'qant:pickersDefault',
        fieldNodeType: 'qant:pickersDefault_category',
        multiple: false
    }
};

export {contentTypes, ContentType};
