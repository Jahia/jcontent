import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import {toIconComponent} from '@jahia/react-material';
import PropTypes from 'prop-types';
import React from 'react';

export const getButtonRenderer = ({labelStyle, ...props} = {}) => {
    const ButtonRenderer = ({context}) => {
        const {t} = useTranslation(context.buttonLabelNamespace);

        let label = context.buttonLabel;
        if (labelStyle === 'none') {
            label = null;
        } else if (labelStyle === 'short' && context.buttonLabelShort) {
            label = context.buttonLabelShort;
        }

        return (
            <Button data-sel-role={context.key}
                    label={t(label, context.buttonLabelParams)}
                    icon={context.buttonIcon && toIconComponent(context.buttonIcon)}
                    disabled={context.enabled === false || context.isVisible === false || context.disabled}
                    onClick={e => {
                        e.stopPropagation();
                        context.onClick(context, e);
                    }}
                    {...props}
                    {...context.displayActionProps}
            />
        );
    };

    ButtonRenderer.propTypes = {
        context: PropTypes.object.isRequired
    };

    return ButtonRenderer;
};
