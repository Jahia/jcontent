import {
    findTemplateField,
    fromPageSampleValue,
    getTemplateValue,
    isPageSampleValue,
    PAGE_SAMPLE_SEPARATOR_VALUE,
    toPageSampleValue
} from './pageSamples.utils';

describe('pageSamples.utils', () => {
    const samplePath = '/sites/digitall/samples/pages/landing';

    it('should round-trip a sample path through a dropdown value', () => {
        expect(fromPageSampleValue(toPageSampleValue(samplePath))).toBe(samplePath);
    });

    it('should recognise a sample value', () => {
        expect(isPageSampleValue(toPageSampleValue(samplePath))).toBe(true);
    });

    it('should not mistake a template name for a sample', () => {
        // Templates are JCR node names, which cannot hold a colon - that is what makes the prefix
        // safe to tell the two kinds of choice apart in one dropdown.
        ['home', 'landing-page', 'simple', ''].forEach(template => {
            expect(isPageSampleValue(template)).toBe(false);
            expect(fromPageSampleValue(template)).toBeNull();
        });
    });

    it('should not treat the separator as a sample', () => {
        expect(isPageSampleValue(PAGE_SAMPLE_SEPARATOR_VALUE)).toBe(false);
    });

    it('should be false rather than throwing for a missing value', () => {
        expect(isPageSampleValue(undefined)).toBe(false);
        expect(isPageSampleValue(null)).toBe(false);
        expect(fromPageSampleValue(undefined)).toBeNull();
    });
});

describe('finding the template field', () => {
    // The bug this pins: a field's name is a mangled form key, not the property name, so matching
    // on name === "j:templateName" never fires and the samples were silently never injected.
    const sectionsWith = field => [{
        name: 'content',
        fieldSets: [{name: 'jnt:page', fields: [{name: 'jnt_other', propertyName: 'j:other'}, field]}]
    }];

    it('should find the field by its property name', () => {
        const field = {name: 'jnt_templateName', propertyName: 'j:templateName'};
        expect(findTemplateField(sectionsWith(field))).toBe(field);
    });

    it('should still find it when only the mangled name is available', () => {
        const field = {name: 'jnt_templateName'};
        expect(findTemplateField(sectionsWith(field))).toBe(field);
    });

    it('should find it when the name keeps the prefixed property', () => {
        const field = {name: 'jnt:page_j:templateName'};
        expect(findTemplateField(sectionsWith(field))).toBe(field);
    });

    it('should read the value under the form key, not the property name', () => {
        const formKey = 'jnt_templateName';
        const sections = sectionsWith({name: formKey, propertyName: 'j:templateName'});
        const values = {[formKey]: 'home', 'j:templateName': 'wrong'};
        expect(getTemplateValue(sections, values)).toBe('home');
    });

    it('should survive a form that has no template field', () => {
        expect(findTemplateField([{name: 'content', fieldSets: []}])).toBeUndefined();
        expect(getTemplateValue([{name: 'content', fieldSets: []}], {})).toBeUndefined();
        expect(findTemplateField(undefined)).toBeUndefined();
    });
});
