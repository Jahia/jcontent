CKEDITOR.plugins.add('html5video', {
    requires: 'widget',
    lang: 'en,fr',
    icons: 'html5video',
    init: function (editor) {

        CKEDITOR.dialog.add('html5video', this.path + 'dialogs/html5video.js');
        editor.addContentsCss(this.path + 'css/html5video.css');

        // Creating an Editor Command
//        editor.addCommand("html5video", new CKEDITOR.dialogCommand("html5video"));

        //Creating the Toolbar Button
        editor.ui.addButton("html5video", {
            label: "Insert Video",
            command: "html5video"
        });

        editor.widgets.add('html5video', {
            button: editor.lang.html5video.button,
            template: '' +
                '<div class="ckeditor-html5-video">' +
                '<div class="VideoContainer">' +
                '<a class="ShowVideo" title="" style="display:none"> Show Video </a>' +
                '</div>' +
                '<div class="jahiaFancyboxForm" style="display:none">' +
                '<div class="Video">' +
                '<div class="popup-bodywrapper">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',
            /*
             * Allowed content rules (http://docs.ckeditor.com/#!/guide/dev_allowed_content_rules):
             *  - div-s with text-align,float,margin-left,margin-right inline style rules and required ckeditor-html5-video class.
             *  - video tags with src, controls, width and height attributes.
             */
            allowedContent: 'div(!ckeditor-html5-video){text-align,float,margin-left,margin-right}; video[src,controls,autoplay,width, height,class]{max-width,height};',
            requiredContent: 'div(ckeditor-html5-video); video[src,controls];',
            upcast: function (element) {
                return element.name === 'div' && element.hasClass('ckeditor-html5-video');
            },
            dialog: 'html5video',
            init: function () {
                var src = '';
                var mimetype = '';
                var autoplay = '';
                var align = this.element.getStyle('text-align');

                var width = '';
                var height = '';

                var provider = '';
                var providerId = '';
                var html5 = '';

                // If there's a child (the video element)
                var $VideoContainer = this.element.getChild(0);
                if ($VideoContainer) {
                    var $videoElement = $VideoContainer.getChild(1);
                    // get it's attributes.
                    if ($videoElement) {
                        switch ($videoElement.getName()) {
                            case 'video':
                            {
                                var $source = $videoElement.getChild(0);
                                src = $source.getAttribute('src');
                                mimetype = $source.getAttribute('type');
                                width = $videoElement.getAttribute('width');
                                height = $videoElement.getAttribute('height');
                                //autoplay = $videoElement.getAttribute( 'autoplay' );;
                                break;
                            }
                            default :
                            {
                                provider = $videoElement.getAttribute('data-provider');
                                providerId = $videoElement.getAttribute('data-identifier');
                                width = $videoElement.getAttribute('width');
                                height = $videoElement.getAttribute('height');
                                if ($videoElement.getName() === 'iframe') {
                                    html5 = true;
                                } else {
                                    html5 = false;
                                }
                                console.log("html5" + html5);
                                break;
                            }
                        }
                    }
                }

                // set the dialog with value existing
                if (src) {
                    this.setData('src', src);
                    if (mimetype) {
                        this.setData('mimeType', mimetype);
                    }
                }

                if (provider) {
                    if (provider) {
                        this.setData('provider', provider);
                    }
                    if (providerId) {
                        this.setData('providerId', providerId);
                    }
                    if (html5) {
                        this.setData('html5', html5);
                    }
                }

                if (width) {
                    this.setData('width', width);
                }
                if (height) {
                    this.setData('height', height);
                }

                if (align) {
                    this.setData('align', align);
                } else {
                    this.setData('align', 'none');
                }
            },
            data: function () {
                var toCreate = false;
                // the Video Container for the preview
                var $VideoContainer = this.element.getChild(0);

                if ($VideoContainer) {
                    // the jahiaFancyboxForm for the iframe video
                    var $jahiaFancyboxForm = this.element.getChild(1);
                    var $videoInFancy, $videoBodyWrapper, $videoElem, $videoElemPrev;
                    if ($jahiaFancyboxForm) {
                        $videoInFancy = $jahiaFancyboxForm.getChild(0);
                        if ($videoInFancy) {
                            $videoBodyWrapper = $videoInFancy.getChild(0);
                        }
                    }

                    var videoElementPreview = $VideoContainer.getChild(1);
                    // get it's attributes.
                    var $date = new Date().valueOf();
                    if (!videoElementPreview) {
                        //update videoContainer
                        $VideoContainer.setAttribute('id', 'VideoContainer-' + $date);
                        $VideoContainer.setAttribute('data-identifier', $date);

                        var $ShowVideo = $VideoContainer.getChild(0);
                        if ($ShowVideo) {
                            if (this.data.src) {
                                $ShowVideo.setAttribute('href', '#video-' + $date);
                            } else if (this.data.providerId) {
                                $ShowVideo.setAttribute('href', '#videoExternal-' + $date);
                            }
                            $ShowVideo.setAttribute('rel', $date);
                        }


                        if (this.data.src) {
                            createVideo($date, true, $VideoContainer, true);
                            if ($videoBodyWrapper) {
                                createVideo($date, false, $videoBodyWrapper, false);
                            }
                            toCreate = true;
                        } else if (this.data.providerId && this.data.providerId) {

                            switch (this.data.provider) {
                                case 'youtube' :
                                {

                                }
                                default :
                                {
                                    // Create a new <video> element.
                                    if (this.data.html5) {
                                        createIframeVideo(this.data.provider, this.data.providerId, null, null, null, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createIframeVideo(this.data.provider, this.data.providerId, null, null, null, $videoBodyWrapper, false);
                                        }
                                    } else {
                                        createObjectVideo(this.data.provider, this.data.providerId, null, null, null, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createObjectVideo(this.data.provider, this.data.providerId, null, null, null, $videoBodyWrapper, false);
                                        }
                                    }
                                    toCreate = true;
                                    break;
                                }
                            }
                        }

                    }

                    var $videoElementPreview = $VideoContainer.getChild(1);
                    var $videoElement;
                    if ($videoBodyWrapper) {
                        $videoElement = $videoBodyWrapper.getChild(0);
                    }

                    if (this.data.src) {
                        if ($videoElementPreview.getChild(0)) {
                            var $source = $videoElementPreview.getChild(0);
                            if ($source.getAttribute('src') !== this.data.src) {
                                $source.remove();
                            }
                            if ($videoElement) {
                                $source = $videoElement.getChild(0);
                                if ($source && $source.getAttribute('src') !== this.data.src) {
                                    $source.remove();
                                }
                            }
                            toCreate = true;
                        }

                        if (toCreate) {
                            createSourceVideo($videoElementPreview, this.data.src, this.data.mimetype);
                            if ($videoElement) {
                                createSourceVideo($videoElement, this.data.src, this.data.mimetype);
                            }
                        }

                        if (this.data.width) {
                            $videoElementPreview.setAttribute('width', this.data.width);
                            if ($videoElement) {
                                $videoElement.setAttribute('width', this.data.width);
                            }
                        } else if ($videoElementPreview.getAttribute('width')) {
                            $videoElementPreview.removeAttribute('width');
                            if ($videoElement) {
                                $videoElement.removeAttribute('width');
                            }
                        }

                        if (this.data.height) {
                            $videoElementPreview.setAttribute('height', this.data.height);
                            if ($videoElement) {
                                $videoElement.setAttribute('height', this.data.height);
                            }

                        } else if ($videoElementPreview.getAttribute('height')) {
                            $videoElementPreview.removeAttribute('height');
                            if ($videoElement) {
                                $videoElement.removeAttribute('height');
                            }
                        }

                    } else if (this.data.providerId && this.data.providerId) {
                        //TODO : provider
                        switch (this.data.provider) {
                            case 'dailymotion' :
                            {
                                if ($videoElementPreview) {
                                    if ($videoElementPreview.getName("iframe") && (!this.data.html5 ||
                                        (this.data.html5 && $videoElementPreview.getAttribute('src') !== '//www.dailymotion.com/embed/video/' + this.data.providerId))) {

                                        $VideoContainer.getChild(2).remove();
                                        $videoElementPreview.remove();
                                        if ($videoElement) {
                                            $videoElement.remove();
                                        }
                                        toCreate = true;
                                    } else {
                                        if ($videoElementPreview.getChild(2)) {
                                            $source = $videoElementPreview.getChild(2);
                                            if ($source.getAttribute('value') !== 'http://www.dailymotion.com/swf/video/' + this.data.providerId) {
                                                $videoElementPreview.remove();
                                                toCreate = true;
                                                if ($videoElement) {
                                                    $videoElement.remove();
                                                }
                                            }
                                        }
                                    }
                                }

                                if (toCreate) {
                                    $videoInFancy.setAttribute('id', 'videoExternal-' + $date);
                                    if (this.data.html5) {
                                        createIframeVideo(this.data.provider, this.data.providerId, '//www.dailymotion.com/embed/video/' + this.data.providerId, this.data.width, this.data.height, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createIframeVideo(this.data.provider, this.data.providerId, '//www.dailymotion.com/embed/video/' + this.data.providerId, this.data.width, this.data.height, $videoBodyWrapper, false);
                                        }
                                    } else {
                                        createObjectVideo(this.data.provider, this.data.providerId, 'http://www.dailymotion.com/swf/video/' + this.data.providerId, this.data.width, this.data.height, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createObjectVideo(this.data.provider, this.data.providerId, 'http://www.dailymotion.com/swf/video/' + this.data.providerId, this.data.width, this.data.height, $videoBodyWrapper, false);
                                        }
                                    }
                                }
                                break;
                            }
                            case 'vimeo' :
                            {
                                if ($videoElementPreview) {
                                    if ($videoElementPreview.getName("iframe") && (!this.data.html5 ||
                                        (this.data.html5 && $videoElementPreview.getAttribute('src') !== '//player.vimeo.com/video/' + this.data.providerId))) {
                                        $VideoContainer.getChild(2).remove();
                                        $videoElementPreview.remove();
                                        if ($videoElement) {
                                            $videoElement.remove();
                                        }
                                        toCreate = true;
                                    } else {
                                        if ($videoElementPreview.getChild(2)) {
                                            $source = $videoElementPreview.getChild(2);
                                            if ($source.getAttribute('value') !== 'http://vimeo.com/moogaloop.swf?clip_id=' + this.data.providerId + '&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1') {
                                                $videoElementPreview.remove();
                                                toCreate = true;
                                                if ($videoElement) {
                                                    $videoElement.remove();
                                                }
                                            }
                                        }
                                    }
                                }

                                if (toCreate) {
                                    $videoInFancy.setAttribute('id', 'videoExternal-' + $date);
                                    if (this.data.html5) {
                                        createIframeVideo(this.data.provider, this.data.providerId, '//player.vimeo.com/video/' + this.data.providerId, this.data.width, this.data.height, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createIframeVideo(this.data.provider, this.data.providerId, '//player.vimeo.com/video/' + this.data.providerId, this.data.width, this.data.height, $videoBodyWrapper, false);
                                        }
                                    } else {
                                        createObjectVideo(this.data.provider, this.data.providerId, 'http://vimeo.com/moogaloop.swf?clip_id=' + this.data.providerId + '&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1', this.data.width, this.data.height, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createObjectVideo(this.data.provider, this.data.providerId, 'http://vimeo.com/moogaloop.swf?clip_id=' + this.data.providerId + '&server=vimeo.com&show_title=1&show_byline=1&show_portrait=0&color=&fullscreen=1', this.data.width, this.data.height, $videoBodyWrapper, false);
                                        }
                                    }
                                }
                                break;
                            }
//                            case 'watt' :
//                            {
//                                if ($videoElementPreview) {
//                                    if ($videoElementPreview.getName("iframe") && (!this.data.html5 ||
//                                        (this.data.html5 && $videoElementPreview.getAttribute('src') !== '//www.wat.tv/embedframe/' + this.data.providerId + '?autoStart=0'))) {
//                                        $VideoContainer.getChild(2).remove();
//                                        $videoElementPreview.remove();
//                                        if ($videoElement) {
//                                            $videoElement.remove();
//                                        }
//                                        toCreate = true;
//                                    } else {
//                                        if ($videoElementPreview.getChild(2)) {
//                                            $source = $videoElementPreview.getChild(2);
//                                            if ($source.getAttribute('value') !== 'http://www.wat.tv/swf2/' + this.data.providerId) {
//                                                $videoElementPreview.remove();
//                                                toCreate = true;
//                                                if ($videoElement) {
//                                                    $videoElement.remove();
//                                                }
//                                            }
//                                        }
//                                    }
//                                }
//
//                                if (toCreate) {
//                                    $videoInFancy.setAttribute('id', 'videoExternal-' + $date);
//                                    if (this.data.html5) {
//                                        createIframeVideo(this.data.provider, this.data.providerId, '//www.wat.tv/embedframe/' + this.data.providerId + '?autoStart=0', this.data.width, this.data.height, $VideoContainer, true);
//                                        if ($videoBodyWrapper) {
//                                            createIframeVideo(this.data.provider, this.data.providerId, '//www.wat.tv/embedframe/' + this.data.providerId + '?autoStart=0', this.data.width, this.data.height, $videoBodyWrapper, false);
//                                        }
//                                    } else {
//                                        createObjectVideo(this.data.provider, this.data.providerId, 'http://www.wat.tv/swf2/' + this.data.providerId, this.data.width, this.data.height, $VideoContainer, true);
//                                        if ($videoBodyWrapper) {
//                                            createObjectVideo(this.data.provider, this.data.providerId, 'http://www.wat.tv/swf2/' + this.data.providerId, this.data.width, this.data.height, $videoBodyWrapper, false);
//                                        }
//                                    }
//                                }
//                                break;
//                            }
                            default :
                            {
                                if ($videoElementPreview) {
                                    if ($videoElementPreview.getName("iframe") && (!this.data.html5 ||
                                        (this.data.html5 && $videoElementPreview.getAttribute('src') !== '//www.youtube.com/embed/' + this.data.providerId + '?html5=1'))) {
                                        $VideoContainer.getChild(2).remove();
                                        $videoElementPreview.remove();
                                        if ($videoElement) {
                                            $videoElement.remove();
                                        }
                                        toCreate = true;
                                    } else if ($videoElementPreview.getName("iframe") && $videoElementPreview.getAttribute('src') !== '//www.youtube.com/embed/' + this.data.providerId) {
                                        $videoElementPreview.remove();
                                        toCreate = true;
                                        if ($videoElement) {
                                            $videoElement.remove();
                                        }
                                    } else {
                                        if ($videoElementPreview.getChild(2)) {
                                            $source = $videoElementPreview.getChild(2);
                                            if ($source) {
                                                $videoElementPreview.remove();
                                                toCreate = true;
                                                if ($videoElement) {
                                                    $videoElement.remove();
                                                }
                                            }
                                        }
                                    }
                                }

                                if (toCreate) {
                                    $videoInFancy.setAttribute('id', 'videoExternal-' + $date);
                                    if (this.data.html5) {
                                        createIframeVideo(this.data.provider, this.data.providerId, '//www.youtube.com/embed/' + this.data.providerId + '?html5=1', this.data.width, this.data.height, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createIframeVideo(this.data.provider, this.data.providerId, '//www.youtube.com/embed/' + this.data.providerId + '?html5=1', this.data.width, this.data.height, $videoBodyWrapper, false);
                                        }
                                    } else {
                                        createIframeVideo(this.data.provider, this.data.providerId, '//www.youtube.com/embed/' + this.data.providerId, this.data.width, this.data.height, $VideoContainer, true);
                                        if ($videoBodyWrapper) {
                                            createIframeVideo(this.data.provider, this.data.providerId, '//www.youtube.com/embed/' + this.data.providerId, this.data.width, this.data.height, $videoBodyWrapper, false);
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }

                    if (this.data.width) {
                        console.log('1.' + $VideoContainer.getAttribute('style'));
                        if (this.data.height) {
                            $VideoContainer.setAttribute('style', 'width:' + this.data.width + 'px;height:' + this.data.height + 'px;');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', 'width:' + this.data.width + 'px;height:' + this.data.height + 'px;');
                            }
                        } else {
                            $VideoContainer.setAttribute('style', 'width:' + this.data.width + 'px;');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', 'width:' + this.data.width + 'px;');
                            }
                        }
                        console.log('2.' + $VideoContainer.getAttribute('style'));
                    } else if ($VideoContainer.getAttribute('style')) {
                        if (this.data.height) {
                            $VideoContainer.setAttribute('style', 'height:' + this.data.height + 'px');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', 'height:' + this.data.height + 'px');
                            }
                        } else {
                            $VideoContainer.setAttribute('style', '');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', '');
                            }
                        }
                    }

                    if (this.data.height) {
                        if (this.data.width) {
                            $VideoContainer.setAttribute('style', 'width:' + this.data.width + 'px;height:' + this.data.height + 'px;');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', 'width:' + this.data.width + 'px;height:' + this.data.height + 'px;');
                            }
                        } else {
                            $VideoContainer.setAttribute('style', 'height:' + this.data.height + 'px;');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', 'height:' + this.data.height + 'px;');
                            }
                        }
                    } else if ($VideoContainer.getAttribute('style')) {
                        if (this.data.width) {
                            $VideoContainer.setAttribute('style', 'width:' + this.data.width + 'px');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', 'width:' + this.data.width + 'px');
                            }
                        } else {
                            $VideoContainer.setAttribute('style', '');
                            if ($videoInFancy) {
                                $videoInFancy.setAttribute('style', '');
                            }
                        }
                    }
                }

                this.element.removeStyle('float');
                this.element.removeStyle('margin-left');
                this.element.removeStyle('margin-right');

                if (this.data.align === 'none') {
                    this.element.removeStyle('text-align');
                } else {
                    this.element.setStyle('text-align', this.data.align);
                    this.element.setStyle('padding-bottom', '10px');
                }

                if (this.data.align === 'left') {
                    this.element.setStyle('float', this.data.align);
                    this.element.setStyle('margin-right', '10px');
                } else if (this.data.align === 'right') {
                    this.element.setStyle('float', this.data.align);
                    this.element.setStyle('margin-left', '10px');
                } else if (this.data.align == 'center') {
                    this.element.setStyle('margin', 'auto');
                    this.element.setStyle('width', '50%');
                }
            }
        });

        if (editor.contextMenu) {
            editor.addMenuGroup('html5videoGroup');
            editor.addMenuItem('html5videoPropertiesItem', {
                label: editor.lang.html5video.videoProperties,
                icon: 'html5video',
                command: 'html5video',
                group: 'html5videoGroup'
            });

            editor.contextMenu.addListener(function (element) {
                if (element &&
                    element.getChild(0) &&
                    element.getChild(0).hasClass &&
                    element.getChild(0).hasClass('ckeditor-html5-video')) {
                    return { html5videoPropertiesItem: CKEDITOR.TRISTATE_OFF };
                }
            });
        }


        function createVideo(date, button, container, preview) {
            // Create a new <video> element.
            var $videoElem = new CKEDITOR.dom.element('video');
            // Set the controls attribute.
            if (preview) {
                $videoElem.setAttribute('id', 'videoPreview-' + date);
                $videoElem.setAttribute('class','video-js vjs-default-skin VideoPreview');
            } else {
                $videoElem.setAttribute('id', 'video-' + date);
                $videoElem.setAttribute('class','video-js vjs-default-skin');
                //$videoElem.setAttribute('autoplay', 'autoplay')
            }

            $videoElem.setAttribute('controls', 'controls');
            $videoElem.setAttribute('controlsList', 'nodownload');
            $videoElem.setAttribute('oncontextmenu', 'return false;');
            $videoElem.setAttribute('preload', 'auto');
            $videoElem.setAttribute('data-setup', '{}');
            // Append it to the container of the plugin.
            container.append($videoElem);
            if (button) {
                addIcon(container);
            }
        }

        function createSourceVideo(container, src, mimetype) {
            var $source = new CKEDITOR.dom.element('source');
            $source.setAttribute('src', src);
            $source.setAttribute('type', mimetype);
            container.append($source);
        }

        function createIframeVideo(provider, providerId, url, width, heigth, container, button) {
            console.log('create iframe')
            var $videoElem = new CKEDITOR.dom.element('iframe');
            $videoElem.setAttribute('data-provider', provider);
            $videoElem.setAttribute('data-identifier', providerId);
            if (url) {
                $videoElem.setAttribute('src', url);
            }


            if (width) {
                $videoElem.setAttribute('width', width);
            } else if ($videoElem.getAttribute('width')) {
                $videoElem.removeAttribute('width');
            }

            if (heigth) {
                $videoElem.setAttribute('height', heigth);
            } else if ($videoElem.getAttribute('height')) {
                $videoElem.removeAttribute('height');
            }

            container.append($videoElem);

            if (button) {
                addIcon(container);
            }
        }

        function createObjectVideo(provider, providerId, url, width, heigth, container, button) {
            console.log('create object')
            var $videoElem = new CKEDITOR.dom.element('object');
            $videoElem.setAttribute('type', 'application/x-shockwave-flash');
            $videoElem.setAttribute('data-provider', provider);
            $videoElem.setAttribute('data-identifier', providerId);
            $videoElem.appendHtml('<param name="allowFullScreen" value="true"/>' +
                '<param name="allowScriptAccess" value="always"/>');

            if (url) {
                var $source = new CKEDITOR.dom.element('param');
                $source.setAttribute('name', 'movie');
                $source.setAttribute('value', url);
                $videoElem.append($source);

                $source = new CKEDITOR.dom.element('embed');
                $source.setAttribute('type', 'application/x-shockwave-flash');
                $source.setAttribute('src', url + '?additionalInfos=0');
                $source.setAttribute('allowfullscreen', 'true');
                $source.setAttribute('allowscriptaccess', 'always');

                if (width) {
                    $source.setAttribute('width', width);
                    $videoElem.setAttribute('width', width);
                }
                if (heigth) {
                    $source.setAttribute('height', heigth);
                    $videoElem.setAttribute('height', heigth);
                }

                $videoElem.append($source);
            }

            // Append it to the container of the plugin.
            container.append($videoElem);

            if (button) {
                addIcon(container);
            }
        }

        function addIcon(container) {
            container.appendHtml('<div class="PlayButtonContainer" style="position:absolute; top:0; bottom:0; left:0; right:0">' +
                '<div class="PlayButtonOverlay"></div>' +
                '<button type="button" class="PlayButton" title="Play">' +
                '<span class="Icon Icon-caret Icon-caret-right">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12">' +
                '<path d="M6.68 6.23l-4.95 4.95L.32 9.77 4.09 6 .32 2.23 1.73.82l4.95 4.95-.23.23.23.23z"></path>' +
                '</svg>' +
                '</span>' +
                '</button>' +
                '</div>');
        }
    }
});
