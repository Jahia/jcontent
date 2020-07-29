import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import React from 'react';

export const getButtonRenderer = ({labelStyle} = {}) => {
    const ButtonRenderer = props => {
        const {buttonLabelNamespace, buttonLabelShort, buttonLabel, isVisible, buttonLabelParams, buttonIcon, key, enabled, disabled, onClick} = props;
        const {t} = useTranslation(buttonLabelNamespace);

        let label = buttonLabel;
        if (labelStyle === 'none') {
            label = null;
        } else if (labelStyle === 'short' && buttonLabelShort) {
            label = buttonLabelShort;
        }

        return (isVisible !== false &&
            <Button isHtml
                    data-sel-role={key}
                    label={t(label, buttonLabelParams)}
                    icon={buttonIcon}
                    disabled={enabled === false || disabled}
                    onClick={e => {
                        e.stopPropagation();
                        onClick(props, e);
                    }}
                    {...props}
            />
        );
    };

    ButtonRenderer.propTypes = {
        buttonLabelNamespace: PropTypes.string,
        buttonLabelShort: PropTypes.string,
        buttonLabel: PropTypes.string,
        isVisible: PropTypes.bool,
        buttonLabelParams: PropTypes.object,
        buttonIcon: PropTypes.node,
        key: PropTypes.string,
        enabled: PropTypes.bool,
        disabled: PropTypes.bool,
        onClick: PropTypes.func
    };

    return ButtonRenderer;
};
