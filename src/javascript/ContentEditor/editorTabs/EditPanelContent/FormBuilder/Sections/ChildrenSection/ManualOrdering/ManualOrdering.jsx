import {FastField} from 'formik';
import React, {Fragment} from 'react';
import {useTranslation} from 'react-i18next';
import {Information, Typography} from '@jahia/moonstone';
import {DraggableReference} from './DragDrop';
import {
    getHiddenChildrenCount,
    isLockedChild,
    keepLockedChildrenInPlace,
    onDirectionalReorder,
    useReorderList
} from '~/ContentEditor/utils';
import PropTypes from 'prop-types';
import {useContentEditorContext, useContentEditorSectionContext} from '~/ContentEditor/contexts';
import {Constants} from '~/ContentEditor/ContentEditor.constants';

export const ManualOrderingField = ({field, form: {setFieldValue, setFieldTouched}, isReadOnly, hiddenChildrenCount}) => {
    const {t} = useTranslation('jcontent');
    const {handleReorder, reorderedItems, reset} = useReorderList(field.value ?? []);

    if (field.value === undefined) {
        // Field has no children
        return null;
    }

    const onValueMove = (droppedId, direction) => {
        // Move using buttons up/down, among the children that can move
        const movables = field.value.filter(child => !isLockedChild(child));
        const movableIndex = movables.indexOf(field.value.find((child, index) => droppedId === `${field.name}[${index}]`));
        const reordered = onDirectionalReorder(movables, `${field.name}[${movableIndex}]`, direction, field.name);
        setFieldValue(field.name, keepLockedChildrenInPlace(field.value, reordered));
        setFieldTouched(field.name, true, false);
    };

    const handleFinalReorder = () => {
        // Move once the element was dropped correctly
        setFieldValue(field.name, keepLockedChildrenInPlace(field.value, reorderedItems.map(({item}) => item)));
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
                            isReadOnly={isReadOnly}
                            isLocked={isLockedChild(item)}
                            onReorder={handleReorder}
                            onValueMove={onValueMove}
                            onReorderDropped={handleFinalReorder}
                            onReorderAborted={reset}
                        />
                    </Fragment>
                );
            })}
            {hiddenChildrenCount > 0 && (
                <div className="flexRow_nowrap alignCenter" data-sel-role="hidden-children-message">
                    <Information/>
                    <Typography variant="caption">
                        {t('jcontent:label.contentEditor.section.listAndOrdering.hiddenChildren', {count: hiddenChildrenCount})}
                    </Typography>
                </div>
            )}
        </>
    );
};

ManualOrderingField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.shape({
        setFieldValue: PropTypes.func.isRequired,
        setFieldTouched: PropTypes.func.isRequired
    }).isRequired,
    isReadOnly: PropTypes.bool,
    hiddenChildrenCount: PropTypes.number
};

export const ManualOrdering = () => {
    const {nodeData} = useContentEditorContext();
    const {sections} = useContentEditorSectionContext();
    const orderingFieldSet = sections?.reduce((found, section) =>
        found || section.fieldSets.find(fs => fs.name === Constants.ordering.automaticOrdering.mixin), null);
    const hiddenChildrenCount = getHiddenChildrenCount(nodeData);
    // Without the hidden children, a move cannot keep them in their positions
    const isReadOnly = orderingFieldSet?.readOnly === true || hiddenChildrenCount > 0;

    return (
        <FastField name={Constants.ordering.childrenKey}>
            {props => <ManualOrderingField {...props} isReadOnly={isReadOnly} hiddenChildrenCount={hiddenChildrenCount}/>}
        </FastField>
    );
};
