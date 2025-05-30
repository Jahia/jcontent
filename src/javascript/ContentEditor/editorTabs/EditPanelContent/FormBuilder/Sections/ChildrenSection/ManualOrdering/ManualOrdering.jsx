import {FastField} from 'formik';
import React, {Fragment} from 'react';
import {DraggableReference} from './DragDrop';
import {onDirectionalReorder, useReorderList} from '~/ContentEditor/utils';
import PropTypes from 'prop-types';

export const ManualOrderingField = ({field, form: {setFieldValue, setFieldTouched}}) => {
    const {handleReorder, reorderedItems, reset} = useReorderList(field.value ?? []);

    if (field.value === undefined) {
        // Field has no children
        return null;
    }

    const onValueMove = (droppedId, direction) => {
        // Move using buttons up/down
        setFieldValue(field.name, onDirectionalReorder(field.value, droppedId, direction, field.name));
        setFieldTouched(field.name, true, false);
    };

    const handleFinalReorder = () => {
        // Move once the element was dropped correctly
        setFieldValue(field.name, reorderedItems.map(({item}) => item));
        setFieldTouched(field.name, true, false);
    };

    return (
        <>
            {reorderedItems.map(({item, index, id}) => {
                return (
                    <Fragment key={`${item.name}-grid`}>
                        <DraggableReference
                            child={item}
                            fieldName={field.name}
                            index={index}
                            id={id}
                            fieldLength={field.value.length}
                            onReorder={handleReorder}
                            onValueMove={onValueMove}
                            onReorderDropped={handleFinalReorder}
                            onReorderAborted={reset}
                        />
                    </Fragment>
                );
            })}
        </>
    );
};

ManualOrderingField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.shape({
        setFieldValue: PropTypes.func.isRequired,
        setFieldTouched: PropTypes.func.isRequired
    }).isRequired
};

export const ManualOrdering = () => {
    return (
        <FastField name="Children::Order">
            {props => <ManualOrderingField {...props}/>}
        </FastField>
    );
};
