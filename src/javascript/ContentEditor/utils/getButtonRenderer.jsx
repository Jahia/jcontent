import {useTranslation} from 'react-i18next';
import {Button, Report} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';
import styles from './getButtonRenderer.scss';

export const getButtonRenderer = ({labelStyle, defaultButtonProps, noIcon} = {}) => {
    const ButtonRenderer = props => {
        const {hasWarningBadge, buttonLabelNamespace, buttonLabelShort, buttonLabel, isVisible, buttonLabelParams, buttonIcon, actionKey, enabled, disabled, onClick, buttonProps, dataSelRole, className} = props;
        const {t} = useTranslation(buttonLabelNamespace);

        let label = buttonLabel;
        if (labelStyle === 'none') {
            label = null;
        } else if (labelStyle === 'short' && buttonLabelShort) {
            label = buttonLabelShort;
        }

        let icon;
        if (!noIcon) {
            icon = buttonIcon;
        }

        if (isVisible === false) {
            return false;
        }

        let button = (
            <Button data-sel-role={dataSelRole || actionKey}
                    className={className}
                    label={t(label, buttonLabelParams)}
                    icon={icon}
                    isDisabled={enabled === false || disabled}
                    onClick={e => {
                        e.stopPropagation();
                        onClick(props, e);
                    }}
                    {...defaultButtonProps}
                    {...buttonProps}
            />
        );

        // Always render the same wrapper element so the button keeps a stable identity across
        // renders. Toggling the root element type (bare button vs wrapped) when hasWarningBadge
        // changes makes React remount the button, which swallows an in-progress click (the badge
        // clears mid-click, e.g. on save) and forces a second click. The wrapper is layout-neutral
        // (display: contents) until the badge is shown, when it becomes the positioned anchor so
        // the absolutely positioned badge attaches to the button instead of the page.
        return (
            <div className={clsx(styles.pastilleWrapper, {[styles.hasBadge]: hasWarningBadge})}>
                {button}
                {hasWarningBadge && (
                    <Report size="big" data-sel-role={`${actionKey}_pastille`} className={styles.warningBadge}/>
                )}
            </div>
        );
    };

    ButtonRenderer.propTypes = {
        buttonLabelNamespace: PropTypes.string,
        buttonLabelShort: PropTypes.string,
        buttonLabel: PropTypes.string,
        isVisible: PropTypes.bool,
        buttonLabelParams: PropTypes.object,
        buttonIcon: PropTypes.node,
        actionKey: PropTypes.string,
        // eslint-disable-next-line react/boolean-prop-naming
        enabled: PropTypes.bool,
        // eslint-disable-next-line react/boolean-prop-naming
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
        buttonProps: PropTypes.object,
        hasWarningBadge: PropTypes.bool,
        dataSelRole: PropTypes.string,
        className: PropTypes.string
    };

    return ButtonRenderer;
};

export const ButtonRenderer = getButtonRenderer();
export const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});
export const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
