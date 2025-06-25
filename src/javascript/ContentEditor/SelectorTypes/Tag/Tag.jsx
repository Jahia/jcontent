import {useTranslation} from 'react-i18next';
import {MultipleInput} from '~/ContentEditor/DesignSystem/MultipleInput';
import React from 'react';
import PropTypes from 'prop-types';
import {adaptSelection} from './Tag.utils';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {useApolloClient} from '@apollo/client';
import {getSuggestionsTagsQuery} from './Tag.gql-queries';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';
import styles from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/Field.scss';
import {Typography} from '@jahia/moonstone';

const TagMultipleError = () => {
    const {t} = useTranslation('jcontent');
    return (
        <Typography className={styles.errorMessage} data-sel-error="tag-multiple-error">
            {t('label.contentEditor.edit.errors.invalidSelectorType')}
        </Typography>
    );
};

export const Tag = ({field, value, id, onChange, onBlur}) => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const {site} = useContentEditorContext();

    /** Error message for when tag selector type is enabled, but is not marked as multiple */
    if (!field.multiple) {
        return <TagMultipleError/>;
    }

    const separator = field.selectorOptions?.find(option => option.name === 'separator')?.value || ',';

    const adaptOptions = options => (
        options.map(data => ({
            value: data,
            label: data
        }))
    );

    const suggestTags = async inputValue => {
        let variables = {
            prefix: inputValue,
            limit: '100',
            startPath: '/sites/' + site
        };

        const val = await client.query({
            query: getSuggestionsTagsQuery,
            variables,
            fetchPolicy: 'network-only'
        });

        return (val.data?.tag?.suggest) ?
            val.data.tag.suggest.map(e => ({value: e.name, label: e.name})) : [];
    };

    return (
        <MultipleInput
            isCreatable
            isAsync
            name={id}
            id={id}
            options={field.data && field.data.values && adaptOptions(field.data.values)}
            value={value && adaptOptions(value)}
            readOnly={field.readOnly}
            placeholder={t('jcontent:label.contentEditor.edit.tagPlaceholder')}
            formatCreateLabel={value => t('jcontent:label.contentEditor.edit.createTagPlaceholder', {tagName: value})}
            loadOptions={suggestTags}
            onChange={selection => {
                const newSelection = selection && selection.map(data => data.value);
                const adaptedSelection = adaptSelection(newSelection, separator);
                onChange(adaptedSelection);
            }}
            onBlur={onBlur}
        />
    );
};

Tag.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    field: FieldPropTypes.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
