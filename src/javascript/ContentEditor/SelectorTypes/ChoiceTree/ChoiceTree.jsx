import React from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {useQuery} from '@apollo/client';
import {GetTreeEntries} from './choiceTree.gql-queries';
import {useTranslation} from 'react-i18next';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {Dropdown} from '@jahia/moonstone';
import {choiceTreeAdapter} from './choiceTree.adapter';

export const ChoiceTree = ({field, value, id, editorContext, onChange, onBlur}) => {
    const {t} = useTranslation('jcontent');
    const {data, error, loading} = useQuery(GetTreeEntries, {
        variables: {
            types: field.selectorOptions?.find(option => option.name === 'types')?.value?.split(',')?.map(type => type.trim()),
            path: field.selectorOptions?.find(option => option.name === 'rootPath')?.value.replace('{site}', editorContext.site),
            language: editorContext.lang
        }
    });

    const handleClear = () => {
        if (field.multiple) {
            onChange([]);
        } else {
            onChange(null);
        }
    };

    const handleChange = (_, selectedValue) => {
        if (field.multiple) {
            const prev = value || [];
            onChange(prev.indexOf(selectedValue.value) > -1 ? prev.filter(i => i !== selectedValue.value) : [...prev, selectedValue.value]);
        } else {
            onChange(selectedValue.value);
        }
    };

    if (error) {
        const message = t(
            'jcontent:label.contentEditor.error.queryingContent',
            {details: `${field.selectorOptions?.find(option => option.name === 'rootPath')?.value} in ${editorContext.lang}`}
        );
        console.warn('unable to resolve choice tree configuration from selector options', field.selectorOptions, error);
        return <>{message}</>;
    }

    if (loading) {
        return <LoaderOverlay/>;
    }

    const tree = choiceTreeAdapter({
        nodes: data.jcr.result.descendants.nodes,
        parent: data.jcr.result,
        selectedValues: value,
        locale: editorContext.lang
    });

    const singleValue = field.multiple ? undefined : value;
    const multipleValue = field.multiple ? (value || []) : undefined;

    return (
        <Dropdown
            hasSearch
            data-sel-role="choice-tree"
            id={id}
            className="flexFluid"
            treeData={tree}
            variant="outlined"
            size="medium"
            value={singleValue}
            values={multipleValue}
            isDisabled={field.readOnly}
            onClear={handleClear}
            onChange={handleChange}
            onBlur={onBlur}
        />
    );
};

ChoiceTree.propTypes = {
    field: FieldPropTypes.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    editorContext: PropTypes.shape({
        lang: PropTypes.string.isRequired,
        site: PropTypes.string.isRequired
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
