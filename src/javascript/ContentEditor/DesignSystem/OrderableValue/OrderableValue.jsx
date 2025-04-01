import {useTranslation} from 'react-i18next';
import {useDrag, useDrop} from 'react-dnd';
import styles from '~/ContentEditor/DesignSystem/OrderableValue/OrderableValue.scss';
import {Button, Close, HandleDrag, ChevronLastPage, ChevronFirstPage, ChevronUp, ChevronDown} from '@jahia/moonstone';
import React from 'react';
import PropTypes from 'prop-types';
import {ReferenceCard} from '../ReferenceCard/ReferenceCard';

export const OrderableValue = ({field, onFieldRemove, onValueReorder, onValueMove, index, component, lastIndex}) => {
    const {t} = useTranslation('jcontent');
    const name = `${field.name}[${index}]`;
    const [{isDropping}, drop] = useDrop({
        accept: `REFERENCE_CARD_${field.name}`, drop: item => onValueReorder(item.name, index), collect: monitor => {
            return {
                isDropping: monitor.isOver() && monitor.canDrop() && monitor.getItem().name !== name
            };
        }
    });
    const [{isDragging}, drag] = useDrag({
        type: `REFERENCE_CARD_${field.name}`, item: {name: name}, collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    return (
        <div key={name}
             ref={field.readOnly ? null : drop}
             className={styles.fieldComponentContainer}
             data-sel-content-editor-multiple-generic-field={name}
             data-sel-content-editor-field-readonly={field.readOnly}
        >
            <div className={`${styles.referenceDropGhostHidden} ${isDropping ? styles.referenceDropGhost : ''}`} data-droppable-zone={name}/>
            {(field.readOnly || !component) ? (
                <div className={styles.draggableCard}>
                    {component}
                </div>
                ) :
                component.type === ReferenceCard ? (
                    <div ref={drag} className={styles.draggableCard}>
                        {React.cloneElement(component, {
                            isDraggable: true,
                            isReadOnly: false,
                            cardAction: lastIndex !== 0 &&
                            <div className={styles.referenceCardActions}>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <Button isDisabled={index === 0} variant="ghost" icon={<ChevronFirstPage style={{transform: 'rotate(90deg)'}}/>} data-sel-action={`moveToFirst_${index}`} onClick={() => onValueMove(name, 'first')}/>
                                    <Button isDisabled={index === lastIndex} variant="ghost" icon={<ChevronLastPage style={{transform: 'rotate(90deg)'}}/>} data-sel-action={`moveToLast_${index}`} onClick={() => onValueMove(name, 'last')}/>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <Button isDisabled={index === 0} variant="ghost" icon={<ChevronUp/>} data-sel-action={`moveUp_${index}`} onClick={() => onValueMove(name, 'up')}/>
                                    <Button isDisabled={index === lastIndex} variant="ghost" icon={<ChevronDown/>} data-sel-action={`moveDown_${index}`} onClick={() => onValueMove(name, 'down')}/>
                                </div>
                            </div>
                    })}
                        {!isDragging &&
                        <Button variant="ghost"
                                data-sel-action={`removeField_${index}`}
                                aria-label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}
                                icon={<Close/>}
                                onClick={() => onFieldRemove(index)}
                        />}
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
    onValueMove: PropTypes.func,
    index: PropTypes.number.isRequired,
    component: PropTypes.object,
    lastIndex: PropTypes.number
};
