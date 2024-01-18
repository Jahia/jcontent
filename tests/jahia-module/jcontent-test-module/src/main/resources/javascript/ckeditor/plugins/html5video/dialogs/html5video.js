CKEDITOR.dialog.add( 'html5video', function( editor ) {
    return {
        title: editor.lang.html5video.title,
        minWidth: 500,
        minHeight: 100,
        contents: [ {
            id: 'info',
            label: editor.lang.html5video.infoLabel,
            elements: [ {
                type: 'vbox',
                padding: 0,
                children: [ {
                    type: 'hbox',
                    widths: [ '100px', '300px','75px' ],
                    align: 'right',
                    children: [{
                        type: 'select',
                        id: 'provider',
                        align: 'center',
                        label: "Provider",
                        items : [['youtube'],['dailymotion'],['vimeo']],
                        setup: function( widget ) {
                            console.log("dialoghtml5 " + widget.data.provider);
                            this.setValue( widget.data.provider );
                        },
                        commit: function( widget ) {
                            widget.setData( 'provider', this.getValue() );
                        }
                    },
                    {
                        type: 'text',
                        id: 'identifier',
                        align: 'center',
                        label: "identifiant",
                        setup: function( widget ) {
                            this.setValue( widget.data.providerId );
                        },
                        commit: function( widget ) {
                            widget.setData( 'providerId', this.getValue() );
                        }
                    },
                        {
                            type: 'checkbox',
                            id: 'html5',
                            // v-align with the 'txtUrl' field.
                            style: 'display:inline-block;margin-top:10px;',
                            align: 'center',
                            label: "HTML5?",
                            setup: function( widget ) {
                                this.setValue( widget.data.html5 );
                            },
                            commit: function( widget ) {
                                console.log('dialog html5' +this.getValue() );
                                widget.setData( 'html5', this.getValue() );
                            }
                        } ]
                } ]
            },
            {
                type: 'vbox',
                padding: 0,
                children: [
                    {
                    type: 'hbox',
                    widths: [ '365px', '110px' ],
                    align: 'right',
                    children: [ {
                        type: 'text',
                        id: 'url',
                        label: editor.lang.html5video.allowed,
                        setup: function( widget ) {
                            this.setValue( widget.data.src );
                        },
                        commit: function( widget ) {
                            widget.setData( 'src', this.getValue() );
                            var result = this.getValue().substring(this.getValue().lastIndexOf(".") + 1)
                            switch (result){
                                case "flv" : {
                                    widget.setData( 'mimetype', "video/x-flv" );
                                    break;
                                }
                                case "ogv" : {
                                    widget.setData( 'mimetype', "video/ogg" );
                                    break;
                                }
                                case "webm" : {
                                    widget.setData( 'mimetype', "video/webm" );
                                    break;
                                }
                                case "wmv" : {
                                    widget.setData( 'mimetype', "video/x-ms-wmv" );
                                    break;
                                }
                                case "avi" : {
                                    widget.setData( 'mimetype', "video/x-msvideo" );
                                    break;
                                }
                                default : {
                                    widget.setData( 'mimetype', "video/mp4" );
                                }
                            }

                        }
                    },
                    {
                        type: 'button',
                        id: 'browse',
                        // v-align with the 'txtUrl' field.
                        style: 'display:inline-block;margin-top:14px;',
                        align: 'center',
                        label: editor.lang.common.browseServer,
                        hidden: true,
                        filebrowser: 'info:url'
                    } ]
                } ]
            },
            {
                type: 'hbox',
                id: 'size',
                children: [ {
                    type: 'text',
                    id: 'width',
                    default : 720,
                    label: editor.lang.common.width,
                    setup: function( widget ) {
                        if ( widget.data.width ) {
                            this.setValue( widget.data.width );
                        }
                    },
                    commit: function( widget ) {
                        widget.setData( 'width', this.getValue() );
                    }
                },
                {
                    type: 'text',
                    id: 'height',
                    default : 480,
                    label: editor.lang.common.height,
                    setup: function( widget ) {
                        if ( widget.data.height ) {
                            this.setValue( widget.data.height );
                        }
                    },
                    commit: function( widget ) {
                        widget.setData( 'height', this.getValue() );
                    }
                }
                ]
            },

            {
                type: 'hbox',
                id: 'alignment',
                children: [ {
                    type: 'radio',
                    id: 'align',
                    label: editor.lang.common.align,
                    items: [
                        [editor.lang.common.alignCenter, 'center'],
                        [editor.lang.common.alignLeft, 'left'],
                        [editor.lang.common.alignRight, 'right'],
                        [editor.lang.common.alignNone, 'none']
                    ],
                    'default': 'center',
                    setup: function( widget ) {
                        if ( widget.data.align ) {
                            this.setValue( widget.data.align );
                        }
                    },
                    commit: function( widget ) {
                        widget.setData( 'align', this.getValue() );
                    }
                } ]
            } ]
        },
        {
            id: 'Upload',
            hidden: true,
            filebrowser: 'uploadButton',
            label: editor.lang.html5video.upload,
            elements: [ {
                type: 'file',
                id: 'upload',
                label: editor.lang.html5video.btnUpload,
                style: 'height:40px',
                size: 38
            },
            {
                type: 'fileButton',
                id: 'uploadButton',
                filebrowser: 'info:url',
                label: editor.lang.html5video.btnUpload,
                'for': [ 'Upload', 'upload' ]
            } ]
        }]
    };
} );
