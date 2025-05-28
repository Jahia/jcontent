import {useTranslation} from 'react-i18next';
import {useDrag, useDrop} from 'react-dnd';
import clsx from 'clsx';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {Button, Close, HandleDrag} from '@jahia/moonstone';
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

const isDraggable = component => {
    if (!component) {
        return false;
    }

    if (typeof component.props.readOnly === 'boolean') {
        return !component.props.readOnly;
    }

    if (typeof component.props.isDraggable === 'boolean') {
        return component.props.isDraggable;
    }

    // Check if the component has multiple values
    return (component.props.values?.[component.props.field?.name]?.length ?? 0) > 1;
};

export const OrderableValue = ({field, onFieldRemove, onValueReorder, index, component, isReferenceCard = false}) => {
    const canDrag = useMemo(() => isDraggable(component), [component]);

    const {t} = useTranslation('jcontent');
    const name = `${field.name}[${index}]`;
    const [{isDropping}, drop] = useDrop({
        accept: `REFERENCE_CARD_${field.name}`,
        drop: item => onValueReorder(item.name, index),
        collect: monitor => {
            return {
                isDropping: monitor.isOver() && monitor.canDrop() && monitor.getItem().name !== name
            };
        }
    });
    const [{isDragging}, drag] = useDrag({
        canDrag: () => canDrag,
        type: `REFERENCE_CARD_${field.name}`,
        item: {name: name},
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    return (
        <div key={name}
             ref={field.readOnly ? null : drop}
             id={name}
             className={styles.fieldComponentContainer}
             data-sel-content-editor-multiple-generic-field={name}
             data-sel-content-editor-field-readonly={field.readOnly}
        >
            <div className={`${styles.referenceDropGhostHidden} ${isDropping ? styles.referenceDropGhost : ''}`} data-droppable-zone={name}/>
            {component &&
                <div ref={isReferenceCard ? drag : null} className={styles.draggableCard} draggable={canDrag}>
                    {!isDragging &&
                        <>
                            {!isReferenceCard &&
                            <div ref={drag} className={clsx({[styles.draggableIcon]: canDrag})} draggable={canDrag}>
                                <HandleDrag size="big"/>
                            </div>}
                            {component}
                        </>}
                    {!isDragging && <Button variant="ghost"
                                            data-sel-action={`removeField_${index}`}
                                            aria-label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}
                                            icon={<Close/>}
                                            onClick={() => onFieldRemove(index)}
                    />}
                </div>}
        </div>
    );
};

OrderableValue.propTypes = {
    field: PropTypes.object.isRequired,
    onFieldRemove: PropTypes.func,
    onValueReorder: PropTypes.func,
    index: PropTypes.number.isRequired,
    component: PropTypes.object,
    isReferenceCard: PropTypes.bool
};
