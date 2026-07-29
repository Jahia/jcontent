import {useTranslation} from 'react-i18next';
import {Button, Report} from '@jahia/moonstone';
import React from 'react';
import clsx from 'clsx';
import styles from './getButtonRenderer.scss';

/**
 * @typedef {object} ButtonRendererProps
 * @property {string} [buttonLabelNamespace]
 * @property {string} [buttonLabelShort]
 * @property {string} [buttonLabel]
 * @property {boolean} [isVisible]
 * @property {object} [buttonLabelParams]
 * @property {React.ReactNode} [buttonIcon]
 * @property {string} [actionKey]
 * @property {boolean} [enabled]
 * @property {boolean} [disabled]
 * @property {(props: ButtonRendererProps, e: React.MouseEvent) => void} [onClick]
 * @property {object} [buttonProps]
 * @property {boolean} [hasWarningBadge]
 * @property {string} [dataSelRole]
 * @property {string} [className]
 */

export const getButtonRenderer = ({labelStyle, defaultButtonProps, noIcon} = {}) => {
    /** @type {React.FC<ButtonRendererProps>} */
    const ButtonRenderer = props => {
        // eslint-disable-next-line react/prop-types -- props are typed via the ButtonRendererProps JSDoc typedef
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

    return ButtonRenderer;
};

export const ButtonRenderer = getButtonRenderer();
export const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});
export const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
