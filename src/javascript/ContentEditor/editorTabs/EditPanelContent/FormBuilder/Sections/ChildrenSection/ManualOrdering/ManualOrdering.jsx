import {FastField} from 'formik';
import React, {Fragment} from 'react';
import {DraggableReference} from './DragDrop';
import {onListReorder} from '~/ContentEditor/utils';

export const ManualOrdering = () => {
    return (
        <FastField name="Children::Order">
            {({field, form: {setFieldValue, setFieldTouched}}) => {
                if (field.value === undefined) {
                    // Field has no children
                    return null;
                }

                const handleReorder = (droppedId, index) => {
                    setFieldValue(field.name, onListReorder(field.value, droppedId, index, field.name));
                    setFieldTouched(field.name, true, false);
                };

                return (
                    <>
                        {field.value.map((child, i) => {
                            return (
                                <Fragment key={`${child.name}-grid`}>
                                    <DraggableReference child={child}
                                                        fieldName={field.name}
                                                        index={i}
                                                        onReorder={handleReorder}
                                    />
                                </Fragment>
                            );
                        })}
                        {field.value && field.value.length > 0 && (
                        <DraggableReference
                                        fieldName={field.name}
                                        index={field.value.length}
                                        onReorder={handleReorder}/>
                                    )}
                    </>
                );
            }}
        </FastField>
    );
};
