import React from 'react';
import PropTypes from 'prop-types';
import {CardSelector, Chip, EmptyCardSelector} from '@jahia/moonstone';

const ReferenceCardCmp = ({
    id,
    classes,
    isReadOnly,
    isError,
    emptyLabel,
    emptyIcon,
    fieldData,
    labelledBy,
    onClick,
    isDraggable,
    cardAction
}) => {
    // If card have already data
    if (fieldData) {
        return (
            <CardSelector
                id={id}
                isDraggable={isDraggable}
                thumbnailType="icon"
                thumbnailURL={fieldData.url && fieldData.url}
                displayName={fieldData.name && fieldData.name}
                chips={fieldData.type && [<Chip key={fieldData.name && fieldData.name} color="accent" label={fieldData.type}/>]}
                systemName={fieldData.systemname && fieldData.systemname}
                information={fieldData.info && fieldData.info}
                isReadOnly={isReadOnly}
                isDisabled={false}
                hasError={isError}
                data-sel-field-picker="filled"
                data-sel-field-picker-action="openPicker"
                cardAction={cardAction}
                onClick={onClick}
            />
        );
    }

    return (
        <EmptyCardSelector
            id={id}
            iconStart={emptyIcon}
            label={emptyLabel}
            isReadOnly={isReadOnly}
            data-sel-media-picker="empty"
            data-sel-field-picker-action="openPicker"
            type="button"
            aria-disabled={isReadOnly}
            aria-labelledby={labelledBy}
            onClick={onClick}
        />
    );
};

ReferenceCardCmp.defaultProps = {
    isDraggable: false,
    isReadOnly: false,
    fieldData: null,
    emptyLabel: '',
    emptyIcon: null,
    onClick: () => {}
};

ReferenceCardCmp.propTypes = {
    id: PropTypes.string,
    isReadOnly: PropTypes.bool,
    isError: PropTypes.bool,
    classes: PropTypes.object,
    onClick: PropTypes.func,
    fieldData: PropTypes.shape({
        url: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string,
        systemname: PropTypes.string,
        info: PropTypes.string.isRequired
    }),
    cardAction: PropTypes.element,
    isDraggable: PropTypes.bool,
    emptyLabel: PropTypes.string,
    emptyIcon: PropTypes.element,
    labelledBy: PropTypes.string
};

export const ReferenceCard = (ReferenceCardCmp);

ReferenceCard.displayName = 'ReferenceCard';
