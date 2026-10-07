import {getDataToMutate} from '~/ContentEditor/utils';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {adaptCreateRequest} from '~/ContentEditor/ContentEditor/createNode/adaptCreateRequest';
import {onServerError} from '~/ContentEditor/validation';
import copyPasteQueries from '~/JContent/actions/copyPaste/copyPaste.gql-mutations';
import {PAGE_ONLY_SKIPPED_TYPES} from '~/JContent/actions/copyPaste/copyPaste.constants';
import {fromPageSampleValue, TEMPLATE_PROPERTY_NAME} from './pageSamples.utils';
import {ApplySamplePropertiesMutation} from './pageSamples.gql-mutations';

/**
 * Creates a page by copying a page sample, rather than by adding an empty node.
 *
 * The name is worked out exactly as an ordinary create would: the same getDataToMutate and
 * adaptCreateRequest pair, which turns the form's system-name field into an encoded node name. The
 * copy is then pasted under the same parent with that name, so the author gets the page they named
 * holding the sample's layout.
 *
 * Only the page itself is copied. Sub-pages, links and menu labels are skipped, the same rule the
 * "copy page only" action applies and the rule under which the sample was saved.
 *
 * The copy carries the sample's own properties, so whatever the author typed in the form is applied
 * on top of it afterwards - otherwise they would name a page "Spring sale" and get one titled after
 * the sample. The chosen template value is dropped on the way: it names a sample, not a template,
 * and has no meaning as a property.
 *
 * @param {object} options - everything the create flow already has to hand
 * @returns {Promise} - resolves with the created node info, like createNode does
 */
export const createPageFromSample = ({
    client,
    t,
    notificationContext,
    actions,
    createCallback,
    sampleValue,
    data: {nodeData, sections, values, language, i18nContext}
}) => {
    const {propsToSave, propFieldNameMapping} = getDataToMutate({formValues: values, i18nContext, sections, lang: language});
    const {uuid: parentUuid, name} = adaptCreateRequest({
        uuid: nodeData.uuid,
        // Same derivation as an ordinary create: the form value carries a forced name (named child)
        // even when the system name field is not in the form.
        name: values[Constants.systemName.name] || nodeData.newName,
        properties: propsToSave
    });

    // The sample reference itself is not a property of the new page.
    const authoredProperties = propsToSave.filter(property => property.name !== TEMPLATE_PROPERTY_NAME);

    return client.mutate({
        mutation: copyPasteQueries.pasteNode,
        variables: {
            pathOrId: fromPageSampleValue(sampleValue),
            destParentPathOrId: parentUuid,
            destName: name,
            nodeTypesToSkip: PAGE_ONLY_SKIPPED_TYPES
        }
    }).then(async result => {
        const newNode = result.data.jcr.pasteNode.node;

        if (authoredProperties.length > 0) {
            await client.mutate({
                mutation: ApplySamplePropertiesMutation,
                variables: {pathOrId: newNode.uuid, properties: authoredProperties}
            });
        }

        const info = {newNode, language};
        if (createCallback) {
            createCallback(info);
        }

        client.cache.flushNodeEntryById(nodeData.uuid);
        actions.setSubmitting(false);
        return info;
    }, error => {
        onServerError(error, actions, i18nContext, language, notificationContext, t, propFieldNameMapping, 'jcontent:label.contentEditor.create.createButton.error');
    });
};
