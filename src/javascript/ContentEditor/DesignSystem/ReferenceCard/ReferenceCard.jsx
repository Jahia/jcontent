import React from 'react';
import PropTypes from 'prop-types';
import {CardSelector, Chip, EmptyCardSelector} from '@jahia/moonstone';
import styles from './ReferenceCard.scss';
import clsx from 'clsx';

const getThumbnailType = type => {
    if (typeof type === 'undefined') {
        return null;
    }

    if (type.startsWith('image')) {
        return 'preview';
    }

    return 'icon';
};

const ReferenceCardCmp = ({
    id,
    className,
    isReadOnly,
    isError,
    emptyLabel,
    emptyIcon,
    fieldData,
    onClick,
    cardAction,
    ...props
}) => {
    // If card have already data
    if (fieldData) {
        return (
            <CardSelector
                id={id}
                className={clsx(styles.referenceCard, {[styles.referenceCard_hasClick]: typeof onClick === 'function'}, className)}
                thumbnailType={getThumbnailType(fieldData.type)}
                thumbnail={fieldData.thumbnail}
                displayName={fieldData.displayName}
                chips={fieldData.type && [<Chip key={fieldData.name} data-sel-referenceCard-type color="accent" label={fieldData.type}/>]}
                systemName={fieldData.name}
                information={fieldData.info}
                isReadOnly={isReadOnly}
                hasError={isError}
                data-sel-field-picker="filled"
                data-sel-field-picker-action="openPicker"
                cardAction={cardAction}
                onClick={onClick}
                {...props}
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
            onClick={onClick}
            {...props}
        />
    );
};

ReferenceCardCmp.defaultProps = {
    isReadOnly: false,
    fieldData: null,
    emptyLabel: '',
    emptyIcon: null,
    onClick: () => {}
};

ReferenceCardCmp.propTypes = {
    id: PropTypes.string.isRequired,
    isReadOnly: PropTypes.bool,
    isError: PropTypes.bool,
    className: PropTypes.object,
    onClick: PropTypes.func,
    fieldData: PropTypes.shape({
        thumbnail: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        displayName: PropTypes.string.isRequired,
        type: PropTypes.string,
        name: PropTypes.string,
        info: PropTypes.string
    }),
    cardAction: PropTypes.node,
    emptyLabel: PropTypes.string,
    emptyIcon: PropTypes.element
};

export const ReferenceCard = (ReferenceCardCmp);

ReferenceCard.displayName = 'ReferenceCard';
