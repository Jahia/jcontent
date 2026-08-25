import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ReferenceCard} from '~/ContentEditor/DesignSystem/ReferenceCard';
import {Tooltip, File, Button, ChevronLastList, ChevronFirstList, ChevronUp, ChevronDown} from '@jahia/moonstone';
import {useFocusOnMove, useReorderDrag, useReorderDrop} from '~/ContentEditor/utils';
import {getIconFromNode, getWebpUrl} from '~/utils';
import styles from '~/ContentEditor/utils/dragAndDrop.scss';
import clsx from 'clsx';

export const DraggableReference = ({
    id,
    child,
    index,
    onReorder,
    onReorderDropped,
    onReorderAborted,
    onValueMove,
    fieldName,
    fieldLength,
    isReadOnly,
    focusId
}) => {
    const {t} = useTranslation('jcontent');
    const isDraggable = fieldLength > 1 && !isReadOnly;

    const ref = useRef(null);
    const staticRef = useRef(null);
    // The card is what gets the focus after a move, so the element has to be reachable whether or
    // not it is draggable - only the draggable one is wired to react-dnd.
    const cardRef = isDraggable ? ref : staticRef;
    useFocusOnMove(cardRef, focusId);
    const [{handlerId}, drop] = useReorderDrop(
        {ref, index, onReorder},
        {
            accept: 'REFERENCE_CARD'
        });

    const [{isDragging}, drag] = useReorderDrag(
        {item: {index, id}, onDrop: () => onReorderDropped(child.name), onAbort: onReorderAborted},
        {
            type: 'REFERENCE_CARD',
            canDrag: () => isDraggable
        });

    drag(drop(ref));

    return (
        <div
            ref={cardRef}
            // Focusable programmatically after a move, without joining the tab order.
            tabIndex={-1}
            className={clsx(
                styles.draggableCard,
                isDragging && styles.draggingCard
            )}
            data-handler-id={handlerId}
        >
            <ReferenceCard
                id={child.name}
                emptyLabel={t('jcontent:label.contentEditor.edit.fields.imagePicker.addImage')}
                emptyIcon={<File/>}
                isReadOnly={child.readOnly}
                cardAction={fieldLength > 1 && !isReadOnly &&
                    <div className={styles.referenceCardActions}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                            <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveFirst')}>
                                <Button
                                    isDisabled={index === 0}
                                    variant="ghost"
                                    icon={<ChevronFirstList/>}
                                    data-sel-action={`moveToFirst_${index}`}
                                    aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveFirst')}
                                    onClick={() => onValueMove(`${fieldName}[${index}]`, 'first', child.name)}
                                />
                            </Tooltip>
                            <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveLast')}>
                                <Button
                                    isDisabled={index === fieldLength - 1}
                                    variant="ghost"
                                    icon={<ChevronLastList/>}
                                    data-sel-action={`moveToLast_${index}`}
                                    aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveLast')}
                                    onClick={() => onValueMove(`${fieldName}[${index}]`, 'last', child.name)}
                                />
                            </Tooltip>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                            <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveUp')}>
                                <Button
                                    isDisabled={index === 0}
                                    variant="ghost"
                                    icon={<ChevronUp/>}
                                    data-sel-action={`moveUp_${index}`}
                                    aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveUp')}
                                    onClick={() => onValueMove(`${fieldName}[${index}]`, 'up', child.name)}
                                />
                            </Tooltip>
                            <Tooltip label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveDown')}>
                                <Button
                                    isDisabled={index === fieldLength - 1}
                                    variant="ghost"
                                    icon={<ChevronDown/>}
                                    data-sel-action={`moveDown_${index}`}
                                    aria-label={t('jcontent:label.contentEditor.section.listAndOrdering.btnMoveDown')}
                                    onClick={() => onValueMove(`${fieldName}[${index}]`, 'down', child.name)}
                                />
                            </Tooltip>
                        </div>
                    </div>}
                fieldData={{
                    displayName: child.displayName,
                    name: child.name,
                    type: child.primaryNodeType.displayName,
                    thumbnail: child.thumbnailUrl || getWebpUrl(child) || getIconFromNode(child)
                }}
            />
        </div>
    );
};

DraggableReference.propTypes = {
    id: PropTypes.string.isRequired,
    child: PropTypes.object.isRequired,
    fieldName: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onReorder: PropTypes.func.isRequired,
    onValueMove: PropTypes.func.isRequired,
    fieldLength: PropTypes.number,
    isReadOnly: PropTypes.bool,
    focusId: PropTypes.number,
    onReorderDropped: PropTypes.func.isRequired,
    onReorderAborted: PropTypes.func.isRequired
};
