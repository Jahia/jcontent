var basePath = CKEDITOR.basePath;
basePath = basePath.substring(0, basePath.indexOf('ckeditor/javascript/'));

CKEDITOR.plugins.addExternal('html5video', basePath + 'jcontent-test-module/javascript/ckeditor/plugins/html5video/');
CKEDITOR.plugins.addExternal('widgetselection', basePath + 'jcontent-test-module/javascript/ckeditor/plugins/widgetselection/');
CKEDITOR.editorConfig = function (config) {
    config.extraPlugins = 'html5video,widget,widgetselection,clipboard,lineutils';
    config.toolbar_Full =
        [
            {name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'DocProps', 'Preview', 'Print', '-', 'Templates']},
            {name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
            {name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'SpellChecker', 'Scayt']},
            {name: 'forms', items: ['Form',
                'Checkbox',
                'Radio',
                'TextField',
                'Textarea',
                'Select',
                'Button',
                'ImageButton',
                'HiddenField']},
            '/',
            {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
            {name: 'paragraph', items: ['NumberedList',
                'BulletedList',
                '-',
                'Outdent',
                'Indent',
                '-',
                'Blockquote',
                '-',
                'JustifyLeft',
                'JustifyCenter',
                'JustifyRight',
                'JustifyBlock',
                '-',
                'BidiLtr',
                'BidiRtl']},
            {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
            {name: 'insert', items: ['Image', 'html5video', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']},
            '/',
            {name: 'styles', items: ['Styles', 'Format', 'FontSize']},
            {name: 'colors', items: ['TextColor', 'BGColor']},
            {name: 'tools', items: ['Maximize', 'ShowBlocks', '-', 'About']}
        ];
    config.toolbar_Basic =
        [
            {name: 'document', items: ['-', 'Save', 'NewPage', 'DocProps', 'Preview', 'Print', '-', 'Templates']},
            {name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
            {name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'SpellChecker', 'Scayt']},
            {name: 'forms', items: ['Form',
                'Checkbox',
                'Radio',
                'TextField',
                'Textarea',
                'Select',
                'Button',
                'ImageButton',
                'HiddenField']},
            '/',
            {name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
            {name: 'paragraph', items: ['NumberedList',
                'BulletedList',
                '-',
                'Outdent',
                'Indent',
                '-',
                'Blockquote',
                '-',
                'JustifyLeft',
                'JustifyCenter',
                'JustifyRight',
                'JustifyBlock',
                '-',
                'BidiLtr',
                'BidiRtl']},
            {name: 'links', items: ['Link', 'Unlink', 'Anchor']},
            {name: 'insert', items: ['Image', 'html5video', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']},
            '/',
            {name: 'styles', items: ['Styles', 'Format', 'FontSize']},
            {name: 'colors', items: ['TextColor', 'BGColor']},
            {name: 'tools', items: ['Maximize', 'ShowBlocks', '-', 'About']}
        ];
    // Config.allowedContent = 'video(*)[*]; source(*)[*]; div(*)[*]; a(*)[*]; button(*)[*]; p(*)[*]; span(*)[class]; svg(*)[*]';
    config.allowedContent = 'span(*)[class]; video(*)[*]; source(*)[*]; div(*)[*]; a(*)[*]; button(*)[*]; p(*)[*]; svg(*)[*]; path(*)[*]; style(*)[*]; abbr(*)[*]; audio(*)[*]; b(*)[*]; blockquote(*)[*]; br(*)[*]; canvas(*)[*]; caption(*)[*]; cite(*)[*]; data(*)[*]; datalist(*)[*]; dd(*)[*]; del(*)[*]; details(*)[*]; dfn(*)[*]; dialog(*)[*]; dl(*)[*]; dt(*)[*]; em(*)[*]; embed(*)[*]; fieldset(*)[*]; figcaption(*)[*]; figure(*)[*]; form(*)[*]; h1(*)[*]; h2(*)[*]; h3(*)[*]; h4(*)[*]; h5(*)[*]; h6(*)[*]; hr(*)[*]; i(*)[*]; iframe(*)[*]; img(*)[*]; input(*)[*]; ins(*)[*]; kbd(*)[*]; label(*)[*]; legend(*)[*]; li(*)[*]; link(*)[*]; map(*)[*]; mark(*)[*]; nav(*)[*]; object(*)[*]; ol(*)[*]; optgroup(*)[*]; option(*)[*]; output(*)[*]; param(*)[*]; picture(*)[*]; pre(*)[*]; progress(*)[*]; q(*)[*]; rp(*)[*]; rt(*)[*]; s(*)[*]; samp(*)[*]; select(*)[*]; small(*)[*]; strong(*)[*]; style(*)[*]; sub(*)[*]; summary(*)[*]; sup(*)[*]; table(*)[*]; tbody(*)[*]; td(*)[*]; template(*)[*]; textarea(*)[*]; tfoot(*)[*]; th(*)[*]; thead(*)[*]; time(*)[*]; title(*)[*]; tr(*)[*]; track(*)[*]; tt(*)[*]; u(*)[*]; ul(*)[*]; var(*)[*]; wbr(*)[*]';
    config.disallowedContent = 'span{font,font-size,font-family}';
};
