import {getPreviewPath, removeSiblings} from './Preview.utils';
import {buildPreviewContexts} from '~/JContent/preview/previewContext.utils';

const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve(__dirname, './Preview.utils.test.html'), 'utf8');

describe('Preview.utils', () => {
    it('Should preview the content in case no displayable node', () => {
        const nodeData = {uuid: 'dummy_uuid', path: '/sites/digitall/contents/rich_text', displayableNode: null};
        const {primary: previewContext} = buildPreviewContexts(nodeData, 'en', {isCEPreview: true});

        expect(getPreviewPath(nodeData)).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.language).toBe('en');
        expect(previewContext.path).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.contextConfiguration).toBe('module');
        expect(previewContext.templateType).toBe('html');
        expect(previewContext.workspace).toBe('edit');
        expect(previewContext.requestAttributes[0].name).toBe('ce_preview');
        expect(previewContext.requestAttributes[0].value).toBe('dummy_uuid');
    });

    it('Should preview the content in case displayable node is a folder', () => {
        const nodeData = {
            uuid: 'dummy_uuid',
            path: '/sites/digitall/contents/rich_text',
            displayableNode: {path: '/sites/digitall/contents', isFolder: true}
        };
        const {primary: previewContext} = buildPreviewContexts(nodeData, 'en', {isCEPreview: true});

        expect(getPreviewPath(nodeData)).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.language).toBe('en');
        expect(previewContext.path).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.contextConfiguration).toBe('module');
        expect(previewContext.templateType).toBe('html');
        expect(previewContext.workspace).toBe('edit');
        expect(previewContext.requestAttributes[0].name).toBe('ce_preview');
        expect(previewContext.requestAttributes[0].value).toBe('dummy_uuid');
    });

    it('Should preview the content through its own content template when the displayable node is the content itself', () => {
        const nodeData = {
            uuid: 'dummy_uuid',
            path: '/sites/digitall/contents/rich_text',
            displayableNode: {path: '/sites/digitall/contents/rich_text', isFolder: false}
        };
        const {primary: previewContext} = buildPreviewContexts(nodeData, 'en', {isCEPreview: true});

        expect(getPreviewPath(nodeData)).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.language).toBe('en');
        expect(previewContext.path).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.view).toBe('default');
        expect(previewContext.contextConfiguration).toBe('page');
        expect(previewContext.cssSourcePath).toBeUndefined();
        expect(previewContext.templateType).toBe('html');
        expect(previewContext.workspace).toBe('edit');
        expect(previewContext.requestAttributes[0].name).toBe('ce_preview');
        expect(previewContext.requestAttributes[0].value).toBe('dummy_uuid');
    });

    it('Should not pass j:view as the template name when rendering the content template', () => {
        // Under contextConfiguration=page the view argument is the template name, so a j:view
        // value such as digitall's person-portrait-1 (j:view=event) would fail template
        // resolution and leave the preview empty. Core picks the template from j:templateName.
        const nodeData = {
            uuid: 'dummy_uuid',
            path: '/sites/digitall/contents/rich_text',
            displayableNode: {path: '/sites/digitall/contents/rich_text', isFolder: false},
            jView: {value: 'event'}
        };
        const {primary: previewContext} = buildPreviewContexts(nodeData, 'en', {isCEPreview: true});

        expect(previewContext.contextConfiguration).toBe('page');
        expect(previewContext.view).toBe('default');
    });

    it('Should preview a node without a template of its own as a module, with the ancestor page as CSS source', () => {
        const nodeData = {
            uuid: 'dummy_uuid',
            path: '/sites/digitall/contents/rich_text',
            displayableNode: {path: '/sites/digitall/home', isFolder: false}
        };
        const {primary: previewContext} = buildPreviewContexts(nodeData, 'en', {isCEPreview: true});

        expect(previewContext.path).toBe('/sites/digitall/contents/rich_text');
        expect(previewContext.contextConfiguration).toBe('module');
        // Null lets the server fall back to j:view, then to the cm view
        expect(previewContext.view).toBeNull();
        expect(previewContext.cssSourcePath).toBe('/sites/digitall/home');
    });

    it('Should preview the displayable node as a page in case displayable node exist and it\'s not a folder', () => {
        const nodeData = {
            uuid: 'dummy_uuid',
            path: '/sites/digitall/home/rich_text',
            displayableNode: {path: '/sites/digitall/home', isFolder: false}
        };
        const closestPage = {path: '/sites/digitall/home', view: 'default'};
        const {primary: previewContext} = buildPreviewContexts(nodeData, 'en', {closestPage, isCEPreview: true});

        expect(getPreviewPath(nodeData)).toBe('/sites/digitall/home');
        expect(previewContext.language).toBe('en');
        expect(previewContext.path).toBe('/sites/digitall/home');
        expect(previewContext.view).toBe('default');
        expect(previewContext.contextConfiguration).toBe('page');
        expect(previewContext.templateType).toBe('html');
        expect(previewContext.workspace).toBe('edit');
        expect(previewContext.requestAttributes[0].name).toBe('ce_preview');
        expect(previewContext.requestAttributes[0].value).toBe('dummy_uuid');
        expect(previewContext.requestAttributes[1].name).toBe('preview_wrapper');
        expect(previewContext.requestAttributes[1].value).toBe('/sites/digitall/home/rich_text');
    });

    it('Should zoom on the content by cleaning the html', () => {
        document.documentElement.innerHTML = html.toString();
        expect(document.getElementsByClassName('should_be_removed').length).toBe(9);
        expect(document.getElementsByClassName('should_be_keeped').length).toBe(10);
        removeSiblings(document.getElementById('ce_preview_content'));
        expect(document.getElementsByClassName('should_be_removed').length).toBe(0);
        expect(document.getElementsByClassName('should_be_keeped').length).toBe(10);
    });
});
