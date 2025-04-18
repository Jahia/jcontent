import {useTranslation} from 'react-i18next';
import {useDrag, useDrop} from 'react-dnd';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {Button, Close, HandleDrag} from '@jahia/moonstone';
import React from 'react';
import PropTypes from 'prop-types';

export const OrderableValue = ({field, onFieldRemove, onValueReorder, index, component}) => {
    console.log(field);
    console.log(component);
    const {t} = useTranslation('jcontent');
    const id = component?.props.id;
    const uuid = component?.props?.fieldData?.uuid;
    const value = component?.props?.value;
    const droppedId = uuid ? uuid : id ? id : value ? value : '';
    console.log(uuid + ' or ' + id + ' or ' + value);
    const [{isDropping}, drop] = useDrop({
        accept: `REFERENCE_CARD_${field.name}`, drop: item => onValueReorder(item.droppedId, index), collect: monitor => {
            return {
                isDropping: monitor.isOver() && monitor.canDrop() && monitor.getItem().id !== id
            };
        }
    });
    const [{isDragging}, drag] = useDrag({
        type: `REFERENCE_CARD_${field.name}`, item: {droppedId: droppedId}, collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });
    return (
        <div key={id}
             ref={field.readOnly ? null : drop}
             id={id}
             className={styles.fieldComponentContainer}
             data-sel-content-editor-multiple-generic-field={id}
             data-sel-content-editor-field-readonly={field.readOnly}
        >
            <div className={`${styles.referenceDropGhostHidden} ${isDropping ? styles.referenceDropGhost : ''}`} data-droppable-zone={id}/>
            {/* Empty div needed to avoid an extra empty visible selector div */}
            {(field.readOnly || !component) ? (
                <div className={styles.draggableCard}>
                    {component}
                </div>
                ) : (
                    <div className={styles.draggableCard}>
                        {!isDragging &&
                            <>
                                <div ref={drag} className={styles.draggableIcon}>
                                    <HandleDrag size="big"/>
                                </div>
                                {component}
                            </>}
                        {!isDragging && <Button variant="ghost"
                                                data-sel-action={`removeField_${index}`}
                                                aria-label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}
                                                icon={<Close/>}
                                                onClick={() => onFieldRemove(index)}
                        />}
                    </div>
                )}
        </div>
    );
};

OrderableValue.propTypes = {
    field: PropTypes.object.isRequired,
    onFieldRemove: PropTypes.func,
    onValueReorder: PropTypes.func,
    index: PropTypes.number.isRequired,
    component: PropTypes.object
};
