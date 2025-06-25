import {useTranslation} from 'react-i18next';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import {Button, Tooltip, Close, HandleDrag} from '@jahia/moonstone';
import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {useReorderDrag, useReorderDrop} from '~/ContentEditor/utils';
import clsx from 'clsx';

export const OrderableValue = ({id, field, onFieldRemove, onValueReorder, onValueReorderDropped, onValueReorderAborted, index, component, isReferenceCard = false, isDraggable = false}) => {
    const {t} = useTranslation('jcontent');
    const ref = useRef(null);
    const name = `${field.name}[${index}]`;
    const readOnly = field.readOnly;
    const [{handlerId}, drop] = useReorderDrop(
        {ref, index, onReorder: onValueReorder},
        {
            accept: `REFERENCE_CARD_${field.name}`
        });
    const [{isDragging}, drag, dragPreview] = useReorderDrag(
        {item: {id, index}, onDrop: onValueReorderDropped, onAbort: onValueReorderAborted},
        {
            type: `REFERENCE_CARD_${field.name}`,
            canDrag: () => isDraggable
        });

    if (isReferenceCard) {
        drag(drop(ref));
    } else {
        drop(dragPreview(ref));
    }

    return (
        <div
            ref={isDraggable ? ref : undefined}
            className={clsx(
                styles.draggableCard,
                isDragging && styles.draggingCard
            )}
            data-sel-content-editor-multiple-generic-field={name}
            data-sel-content-editor-field-readonly={field.readOnly}
            data-handler-id={handlerId}
        >
            {!isReferenceCard && !readOnly &&
            <div ref={isDraggable ? drag : null} className={clsx(isDraggable ? styles.draggableIcon : styles.notDraggableIcon)}>
                <HandleDrag size="big"/>
            </div>}
            {component}
            {!readOnly &&
                <Tooltip label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}>
                    <Button variant="ghost"
                            data-sel-action={`removeField_${index}`}
                            aria-label={t('jcontent:label.contentEditor.edit.fields.actions.clear')}
                            icon={<Close/>}
                            onClick={() => onFieldRemove(index)}
                        />
                </Tooltip>}
        </div>
    );
};

OrderableValue.propTypes = {
    id: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    onFieldRemove: PropTypes.func,
    onValueReorder: PropTypes.func,
    onValueReorderDropped: PropTypes.func,
    onValueReorderAborted: PropTypes.func,
    index: PropTypes.number.isRequired,
    component: PropTypes.object.isRequired,
    isReferenceCard: PropTypes.bool,
    isDraggable: PropTypes.bool
};
