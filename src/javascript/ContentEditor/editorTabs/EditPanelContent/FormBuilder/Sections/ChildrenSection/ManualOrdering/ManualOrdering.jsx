import {FastField} from 'formik';
import React, {Fragment} from 'react';
import {DraggableReference, DropableSpace} from './DragDrop';
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
                    setFieldValue(field.name, onListReorder(field.value, droppedId, index));
                    setFieldTouched(field.name, true, false);
                };

                return (
                    <>
                        <DropableSpace
                            childUp={null}
                            childDown={field.value[0]}
                            index={0}
                            onReorder={handleReorder}
                        />
                        {field.value.map((child, i) => {
                            return (
                                <Fragment key={`${child.name}-grid`}>
                                    <DraggableReference child={child}/>
                                    <DropableSpace
                                        childUp={child}
                                        childDown={field.value[i + 1]}
                                        index={i + 1}
                                        onReorder={handleReorder}
                                    />
                                </Fragment>
                            );
                        })}
                    </>
                );
            }}
        </FastField>
    );
};
