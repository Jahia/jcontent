import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {MenuItem, Separator} from '@jahia/moonstone';

export let MenuItemRenderer = ({buttonLabel, buttonLabelParams, menuContext, menuState, buttonIcon, actionKey, enabled, isSeparator, onClick, onMouseEnter, onMouseLeave, buttonProps}) => {
    const {t} = useTranslation('jcontent');
    const [hover, setHover] = useState(false);

    if (isSeparator) {
        return <Separator invisible="firstOrLastChild" />;
    }

    const onEnter = e => {
        onMouseEnter(e);
        setHover(true);
    };

    const onLeave = e => {
        onMouseLeave(e);
        setHover(false);
    };

    let h = hover;
    if (menuContext) {
        h = h || menuState.isInMenu;
    }

    // eslint-disable-next-line react/no-danger
    const label = <span dangerouslySetInnerHTML={{__html: t(buttonLabel, buttonLabelParams)}}/>;

    const isDisabled = enabled === false;

    const {isShowIcons, ...otherButtonProps} = buttonProps || {};

    return (
        <MenuItem
            iconStart={isShowIcons && buttonIcon}
            data-sel-role={actionKey}
            {...otherButtonProps}
            label={label}
            isHover={h}
            isDisabled={isDisabled}
            onClick={isDisabled ? null : onClick}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        />
    );
};

MenuItemRenderer.propTypes = {
    actionKey: PropTypes.string.isRequired,
    buttonLabel: PropTypes.string.isRequired,
    buttonLabelParams: PropTypes.object,
    menuContext: PropTypes.object,
    menuState: PropTypes.object,
    buttonIcon: PropTypes.object,
    enabled: PropTypes.bool,
    isSeparator: PropTypes.bool,

    /**
     * Function to call when the menu item is clicked
     */
    onClick: PropTypes.func.isRequired,

    /**
     * Function to call when the menu item is hovered
     */
    onMouseEnter: PropTypes.func,
    /**
     * Function to call when the menu item is left
     */
    onMouseLeave: PropTypes.func,

    /**
     * Additional props to pass to the menu item element
     */
    buttonProps: PropTypes.object
};
