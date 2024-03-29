import {validateForm} from './validateForm';

describe('validation utils', () => {
    describe('validateForm', () => {
        let sections = [{
            fieldSets: [{
                fields: [
                    {name: 'field1'},
                    {name: 'field2'}
                ]
            }]
        }];
        let formik;
        let componentRenderer;
        let render;
        let errors;
        beforeEach(() => {
            render = jest.fn();
            componentRenderer = {render};
            errors = {
                field1: 'required',
                field2: 'required'
            };
            formik = {
                validateForm: jest.fn(() => Promise.resolve(errors)),
                setTouched: jest.fn(() => Promise.resolve())
            };
        });

        it('should return null when there is no errors', async () => {
            errors = {};
            expect((await validateForm({formik, i18nContext: {}, sections, lang: 'en', siteInfo: {}, componentRenderer})).errors).toBeNull();
        });

        it('should return object with errors', async () => {
            expect((await validateForm({formik, i18nContext: {}, sections, lang: 'en', siteInfo: {}, componentRenderer})).errors).toBeDefined();
        });

        it('should set fields in error to touched', async () => {
            await validateForm({formik, i18nContext: {}, sections, lang: 'en', siteInfo: {}, componentRenderer});

            expect(formik.setTouched).toHaveBeenCalledWith({
                field1: true,
                field2: true
            }, false);
        });

        it('should display a modal when field have errors', async () => {
            await validateForm({formik, i18nContext: {}, sections, lang: 'en', siteInfo: {}, componentRenderer});
            expect(render).toHaveBeenCalled();
        });

        it('should not display a modal when field have no errors', async () => {
            errors = {};
            render = jest.fn();
            await validateForm({formik, i18nContext: {}, sections, lang: 'en', siteInfo: {}, componentRenderer});
            expect(render).not.toHaveBeenCalled();
        });
    });
});
