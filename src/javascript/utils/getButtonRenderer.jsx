import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import React from 'react';
import {ellipsizeText} from '~/JContent/JContent.utils';
import {Tooltip} from '@material-ui/core';

const useLabel = labelProps => {
    const {
        buttonLabelNamespace,
        labelStyle,
        buttonLabel,
        buttonLabelShort,
        buttonLabelParams,
        ellipsis,
        showTooltip
    } = labelProps;

    const {t} = useTranslation(buttonLabelNamespace);

    let label = (labelStyle === 'short' && buttonLabelShort) || buttonLabel;
    label = t(label, buttonLabelParams);
    if (ellipsis) {
        label = ellipsizeText(label, ellipsis);
    }

    return {
        label: (labelStyle === 'none') ? null : label,
        tooltipLabel: showTooltip ? label : null
    };
};

export const getButtonRenderer = ({labelStyle, showTooltip, ellipsis, defaultButtonProps, defaultTooltipProps} = {}) => {
    const ButtonRenderer = props => {
        const {
            buttonLabelNamespace,
            buttonLabelShort,
            buttonLabel,
            isVisible,
            buttonLabelParams,
            buttonIcon,
            buttonIconEnd,
            actionKey,
            enabled,
            isDisabled,
            onClick,
            renderOnClick,
            buttonProps,
            tooltipProps
        } = props;

        const {label, tooltipLabel} = useLabel({
            buttonLabelNamespace,
            labelStyle,
            buttonLabel,
            buttonLabelShort,
            buttonLabelParams,
            ellipsis,
            showTooltip
        });

        if (isVisible === false) {
            return false;
        }

        const button = (
            <Button data-sel-role={actionKey}
                    label={label}
                    icon={buttonIcon}
                    iconEnd={buttonIconEnd}
                    disabled={enabled === false || isDisabled}
                    onClick={e => {
                        e.stopPropagation();
                        // Call any onClick handler on the rendering side before calling onClick from the action side
                        if (typeof renderOnClick === 'function') {
                            renderOnClick();
                        }

                        onClick(props, e);
                    }}
                    {...defaultButtonProps}
                    {...buttonProps}
            />
        );

        return (showTooltip) ? (
            <Tooltip title={tooltipLabel} {...defaultTooltipProps} {...tooltipProps}>
                {button}
            </Tooltip>
        ) : button;
    };

    ButtonRenderer.propTypes = {
        buttonLabelNamespace: PropTypes.string,
        buttonLabelShort: PropTypes.string,
        buttonLabel: PropTypes.string,
        isVisible: PropTypes.bool,
        buttonLabelParams: PropTypes.object,
        buttonIcon: PropTypes.node,
        buttonIconEnd: PropTypes.node,
        actionKey: PropTypes.string,
        // eslint-disable-next-line react/boolean-prop-naming
        enabled: PropTypes.bool,
        isDisabled: PropTypes.bool,
        onClick: PropTypes.func,
        renderOnClick: PropTypes.func,
        buttonProps: PropTypes.object,
        tooltipProps: PropTypes.object
    };

    return ButtonRenderer;
};

export const ButtonRenderer = getButtonRenderer();
export const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});
export const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
