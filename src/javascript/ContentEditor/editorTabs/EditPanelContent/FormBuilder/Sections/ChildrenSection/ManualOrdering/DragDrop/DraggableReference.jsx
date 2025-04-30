import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useDrag, useDrop} from 'react-dnd';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {File, Button, ChevronLastList, ChevronFirstList, ChevronUp, ChevronDown} from '@jahia/moonstone';
import {encodeJCRPath} from '~/ContentEditor/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';

export const DraggableReference = ({child, index, onReorder, onValueMove, fieldName, fieldLength}) => {
    const {t} = useTranslation('jcontent');
    const name = `${fieldName}[${index}]`;

    const [{isDropping}, drop] = useDrop({
        accept: 'REFERENCE_CARD',
        drop: item => onReorder(item.name, index),
        collect: monitor => {
            return {
                isDropping: monitor.isOver() &&
                            monitor.canDrop() &&
                            monitor.getItem().name !== name
            };
        }
    });

    const [{isDragging}, drag] = useDrag({
        type: 'REFERENCE_CARD',
        item: {name: name},
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    return (
        <div ref={drop} className={styles.fieldComponentContainer} data-test="draggableReference">
            <div className={`${styles.referenceDropGhostHidden} ${isDropping ? styles.referenceDropGhost : ''}`} data-droppable-zone={name}/>
            {child &&
                <div ref={drag} className={styles.draggableCard}>
                    {!isDragging &&
                        <ReferenceCard
                            id={child.name}
                            emptyLabel={t('jcontent:label.contentEditor.edit.fields.imagePicker.addImage')}
                            emptyIcon={<File/>}
                            labelledBy={`${child.name}-label`}
                            cardAction={fieldLength > 1 &&
                            <div className={styles.referenceCardActions}>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <Button isDisabled={index === 0} variant="ghost" icon={<ChevronFirstList/>} data-sel-action={`moveToFirst_${index}`} aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveFirst')} onClick={() => onValueMove(`${fieldName}[${index}]`, 'first')}/>
                                    <Button isDisabled={index === fieldLength - 1} variant="ghost" icon={<ChevronLastList/>} data-sel-action={`moveToLast_${index}`} aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveLast')} onClick={() => onValueMove(`${fieldName}[${index}]`, 'last')}/>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <Button isDisabled={index === 0} variant="ghost" icon={<ChevronUp/>} data-sel-action={`moveUp_${index}`} aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveUp')} onClick={() => onValueMove(`${fieldName}[${index}]`, 'up')}/>
                                    <Button isDisabled={index === fieldLength - 1} variant="ghost" icon={<ChevronDown/>} data-sel-action={`moveDown_${index}`} aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveLast')} onClick={() => onValueMove(`${fieldName}[${index}]`, 'down')}/>
                                </div>
                            </div>}
                            fieldData={{
                                name: child.displayName,
                                type: child.primaryNodeType.displayName,
                                url: encodeJCRPath(`${child.primaryNodeType.icon}.png`)
                            }}
                        />}
                </div>}
        </div>
    );
};

DraggableReference.propTypes = {
    child: PropTypes.object,
    fieldName: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onReorder: PropTypes.func.isRequired,
    onValueMove: PropTypes.func.isRequired,
    fieldLength: PropTypes.number
};
