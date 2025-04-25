import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useDrag, useDrop} from 'react-dnd';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {File} from '@jahia/moonstone';
import {encodeJCRPath} from '~/ContentEditor/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';

export const DraggableReference = ({child, index, onReorder, fieldName}) => {
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
                <div ref={drag}>
                    {!isDragging &&
                        <ReferenceCard
                            isDraggable
                            id={child.name}
                            emptyLabel={t('jcontent:label.contentEditor.edit.fields.imagePicker.addImage')}
                            emptyIcon={<File/>}
                            labelledBy={`${child.name}-label`}
                            fieldData={{
                                name: child.displayName,
                                info: child.primaryNodeType.displayName,
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
    onReorder: PropTypes.func.isRequired
};
