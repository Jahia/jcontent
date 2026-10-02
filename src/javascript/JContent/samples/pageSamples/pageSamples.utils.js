/**
 * Page samples are offered in the same dropdown as the page templates, after a separator, so the
 * author picks "what this page should look like" in one place rather than being asked twice.
 *
 * A template and a sample produce different things - a template is a property on a new page, a
 * sample is a copy of an existing one - so the chosen value has to say which it is. Sample entries
 * therefore carry a prefix that no template name can collide with, since a template name is a JCR
 * node name and cannot contain a colon.
 */
export const PAGE_SAMPLE_VALUE_PREFIX = 'jcontent:pageSample:';

/**
 * Value of the entry that separates templates from samples in the dropdown. It is rendered disabled
 * and is never a valid choice.
 */
export const PAGE_SAMPLE_SEPARATOR_VALUE = 'jcontent:pageSampleSeparator';

/**
 * @param {string} value - the chosen dropdown value
 * @returns {boolean} - whether it names a page sample rather than a template
 */
export const isPageSampleValue = value => typeof value === 'string' && value.startsWith(PAGE_SAMPLE_VALUE_PREFIX);

/**
 * @param {string} path - path of the sample page
 * @returns {string} - the dropdown value standing for it
 */
export const toPageSampleValue = path => `${PAGE_SAMPLE_VALUE_PREFIX}${path}`;

/**
 * @param {string} value - a dropdown value produced by toPageSampleValue
 * @returns {string|null} - path of the sample page, or null when the value is not a sample
 */
export const fromPageSampleValue = value => (isPageSampleValue(value) ? value.slice(PAGE_SAMPLE_VALUE_PREFIX.length) : null);

/**
 * Property holding the template a page is rendered with.
 */
export const TEMPLATE_PROPERTY_NAME = 'j:templateName';

/**
 * Find the template field in a Content Editor form.
 *
 * A field's `name` is a mangled form key, not the property - `{name: "nt_linkType", propertyName:
 * "j:linkType"}` - so the property name is what identifies a field, and the form value is keyed by
 * `name`. The suffix fallbacks are there because the mangling is not consistent across fields:
 * some keep the prefixed property name, some only its local part.
 *
 * @param {Array} sections - the form sections
 * @returns {object|undefined} - the j:templateName field
 */
export const findTemplateField = sections => sections
    ?.flatMap(section => section.fieldSets ?? [])
    .flatMap(fieldSet => fieldSet.fields ?? [])
    .find(field => field.propertyName === TEMPLATE_PROPERTY_NAME ||
        field.name === TEMPLATE_PROPERTY_NAME ||
        field.name?.endsWith(`_${TEMPLATE_PROPERTY_NAME}`) ||
        field.name?.endsWith('_templateName'));

/**
 * The template value currently held by a form, read under the form's own key for that field.
 *
 * @param {Array} sections - the form sections
 * @param {object} values - the form values
 * @returns {string|undefined} - the chosen template or sample value
 */
export const getTemplateValue = (sections, values) => {
    const field = findTemplateField(sections);
    return field ? values?.[field.name] : undefined;
};
