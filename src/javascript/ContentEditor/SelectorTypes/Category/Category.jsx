import React from 'react';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '~/ContentEditor/ContentEditor.proptypes';
import {ChoiceTree} from '../ChoiceTree';

export const Category = ({field, value, id, editorContext, onChange, onBlur}) => {
    // Set the value of the ChoiceTree component to the value of the Category component
    field.selectorOptions = field.selectorOptions || [];
    field.selectorOptions.push({
        name: 'rootPath',
        value: '/sites/systemsite/categories'
    });
    field.selectorOptions.push({
        name: 'types',
        value: 'jnt:category'
    });
    return <ChoiceTree field={field} value={value} id={id} editorContext={editorContext} onChange={onChange} onBlur={onBlur}/>;
};

Category.propTypes = {
    field: FieldPropTypes.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    editorContext: PropTypes.shape({
        lang: PropTypes.string.isRequired
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};
