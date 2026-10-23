import React from 'react';
import {Constants} from '~/ContentEditor/SelectorTypes/Picker/Picker.constants';
import JContentConstants from '~/JContent/JContent.constants';
import {useMediaPickerInputData} from '~/ContentEditor/SelectorTypes/Picker/configs/mediaPicker/useMediaPickerInputData';
import FileModeSelector from '~/JContent/ContentRoute/ToolBar/FileModeSelector';
import {transformQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/queryHandlers';
import {renderer} from '~/ContentEditor/SelectorTypes/Picker/configs/renderer';
import {FilePickerCaption} from '~/ContentEditor/SelectorTypes/Picker/configs/mediaPicker/FilePickerCaption';
import {cePickerSetFileViewMode} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {FileImage} from '@jahia/moonstone';
import {PickerFilesQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/mediaPicker/PickerFilesQueryHandler';

function getMode(state, config) {
    if (state.contenteditor.picker.fileView.mode === '') {
        return config?.pickerDialog?.view === 'Thumbnail' ? Constants.fileView.mode.THUMBNAILS : Constants.fileView.mode.LIST;
    }

    return state.contenteditor.picker.fileView.mode;
}

/**
 * Image formats a browser renders natively, as tokens matched against the mime type.
 *
 * jmix:image covers more than a browser can show - a TIFF, a PSD or a camera raw file are all
 * images to the repository - but an image field exists to put a picture on a page, and those
 * cannot be put on one: the visitor gets a broken image, and the editor only finds out later.
 * The picker therefore offers what can actually be displayed. This is the same list the
 * thumbnail service keeps, so both agree on what "displayable" means.
 *
 * Add a format here as browsers gain support for it.
 */
const WEB_RENDERABLE_IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'icon'];

const renderableImageFilters = WEB_RENDERABLE_IMAGE_FORMATS.map(format => ({
    evaluation: 'CONTAINS',
    fieldName: 'content.mimeType.value',
    value: format
}));

// Folders carry no mime type, so they need their own way past a filter list combined with ANY,
// otherwise browsing the media tree in the dialog would come up empty.
const FOLDERS_PASS = {evaluation: 'EQUAL', fieldName: 'isFile', value: 'false'};

const viewModeSelectorProps = config => ({
    selector: state => ({
        mode: getMode(state, config)
    }),
    setModeAction: mode => cePickerSetFileViewMode(mode)
});

export const registerMediaPickers = registry => {
    registry.add(Constants.pickerConfig, 'file', {
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalFileTitle',
            usePickerInputData: useMediaPickerInputData
        },
        pickerDialog: {
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalFileTitle'
        },
        selectionTable: {
            getFragments: PickerFilesQueryHandler.getFragments,
            columns: ['publicationStatus', 'name', 'usages', 'fileSize', 'relPath']
        },
        searchContentType: 'jnt:file',
        selectableTypesTable: ['jnt:file'],
        pickerCaptionComponent: FilePickerCaption
    });

    registry.add(Constants.pickerConfig, 'image', {
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalImageTitle',
            emptyIcon: <FileImage/>,
            usePickerInputData: useMediaPickerInputData
        },
        pickerDialog: {
            view: 'Thumbnail',
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalImageTitle',
            displayTree: true,
            displaySiteSwitcher: true,
            displaySearch: true
        },
        selectionTable: {
            getFragments: PickerFilesQueryHandler.getFragments,
            columns: ['publicationStatus', 'name', 'usages', 'fileSize', 'relPath']
        },
        searchContentType: 'jmix:image',
        selectableTypesTable: ['jmix:image'],
        accordionItem: {
            'picker-media': {
                tableConfig: {
                    tableDisplayFilter: [...renderableImageFilters, FOLDERS_PASS]
                }
            },
            'picker-search': {
                tableConfig: {
                    tableDisplayFilter: renderableImageFilters
                }
            }
        },
        pickerCaptionComponent: FilePickerCaption
    });

    registry.add(Constants.pickerConfig, 'pdf', {
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalPDFTitle',
            usePickerInputData: useMediaPickerInputData
        },
        pickerDialog: {
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalPDFTitle'
        },
        selectionTable: {
            getFragments: PickerFilesQueryHandler.getFragments,
            columns: ['publicationStatus', 'name', 'usages', 'fileSize', 'relPath']
        },
        searchContentType: 'jnt:file',
        selectableTypesTable: ['jnt:file'],
        accordionItem: {
            'picker-media': {
                tableConfig: {
                    tableDisplayFilter: [
                        {
                            evaluation: 'CONTAINS',
                            fieldName: 'content.mimeType.value',
                            value: 'pdf'
                        },
                        {evaluation: 'EQUAL', fieldName: 'isFile', value: 'false'}
                    ]
                }
            },
            'picker-search': {
                tableConfig: {
                    tableDisplayFilter: [
                        {
                            evaluation: 'CONTAINS',
                            fieldName: 'content.mimeType.value',
                            value: 'pdf'
                        }
                    ]
                }
            }
        },
        pickerCaptionComponent: FilePickerCaption
    });

    registry.add(Constants.pickerConfig, 'video', {
        pickerInput: {
            emptyLabel: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalVideoTitle',
            usePickerInputData: useMediaPickerInputData
        },
        pickerDialog: {
            view: 'Thumbnail',
            dialogTitle: 'jcontent:label.contentEditor.edit.fields.contentPicker.modalVideoTitle'
        },
        selectionTable: {
            getFragments: PickerFilesQueryHandler.getFragments,
            columns: ['publicationStatus', 'name', 'usages', 'fileSize', 'relPath']
        },
        searchContentType: 'jnt:file',
        selectableTypesTable: ['jnt:file'],
        accordionItem: {
            'picker-media': {
                tableConfig: {
                    tableDisplayFilter: [
                        {
                            evaluation: 'CONTAINS',
                            fieldName: 'content.mimeType.value',
                            value: 'video'
                        },
                        {evaluation: 'EQUAL', fieldName: 'isFile', value: 'false'}
                    ]
                }
            },
            'picker-search': {
                tableConfig: {
                    tableDisplayFilter: [
                        {
                            evaluation: 'CONTAINS',
                            fieldName: 'content.mimeType.value',
                            value: 'video'
                        }
                    ]
                }
            }
        },
        pickerCaptionComponent: FilePickerCaption
    });

    const mediaItem = registry.get(Constants.ACCORDION_ITEM_NAME, Constants.ACCORDION_ITEM_TYPES.MEDIA);
    if (mediaItem) {
        registry.add(Constants.ACCORDION_ITEM_NAME, `picker-${Constants.ACCORDION_ITEM_TYPES.MEDIA}`, {
            ...mediaItem,
            targets: ['default:70', 'image:70', 'file:70', 'pdf:70', 'video:70'],
            tableConfig: {
                ...mediaItem.tableConfig,
                defaultSort: {orderBy: 'lastModified.value', order: 'DESC'},
                queryHandler: transformQueryHandler(PickerFilesQueryHandler),
                openableTypes: ['jnt:folder'],
                hiddenViewModes: [JContentConstants.tableView.viewMode.PAGE_BUILDER],
                viewSelector: ({pickerConfig}) => <FileModeSelector {...viewModeSelectorProps(pickerConfig)}/>,
                contextualMenu: 'contentPickerMenu',
                uploadFilter: (file, mode, pickerConfig) => pickerConfig.key !== 'image' || file.type.startsWith('image/'),
                columns: ['publicationStatus', 'nameBigIcon', 'usages', 'fileSize', 'lastModified']
            },
            treeConfig: {
                ...mediaItem.treeConfig,
                dnd: {}
            }
        }, renderer);
    } else {
        console.warn('Picker will not function properly due to missing accordionItem for media');
    }
};
