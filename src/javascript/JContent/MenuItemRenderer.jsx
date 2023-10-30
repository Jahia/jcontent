import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ChevronDown, ChevronRight, MenuItem, Separator} from '@jahia/moonstone';

export let MenuItemRenderer = ({buttonLabel, buttonLabelParams, menuContext, menuState, buttonIcon, buttonIconEnd, actionKey, enabled, isSeparator, onClick, onMouseEnter, onMouseLeave, buttonProps, isTitle}) => {
    const {t} = useTranslation('jcontent');
    const [hover, setHover] = useState(false);

    if (isSeparator) {
        return <Separator invisible="firstOrLastChild"/>;
    }

    // eslint-disable-next-line react/no-danger
    const label = <span dangerouslySetInnerHTML={{__html: t(buttonLabel, buttonLabelParams)}}/>;

    if (isTitle) {
        return <MenuItem variant="title" label={label}/>;
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

    const isDisabled = enabled === false;

    const {isShowIcons, ...otherButtonProps} = buttonProps || {};

    const iconEnd = (buttonIconEnd?.type === ChevronDown) ? <ChevronRight/> : buttonIconEnd;

    return (
        <MenuItem
            iconStart={isShowIcons && buttonIcon}
            iconEnd={iconEnd}
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
    buttonLabel: PropTypes.string,
    buttonLabelParams: PropTypes.object,
    menuContext: PropTypes.object,
    menuState: PropTypes.object,
    buttonIcon: PropTypes.object,
    buttonIconEnd: PropTypes.object,
    // eslint-disable-next-line react/boolean-prop-naming
    enabled: PropTypes.bool,
    isSeparator: PropTypes.bool,
    isTitle: PropTypes.bool,

    /**
     * Function to call when the menu item is clicked
     */
    onClick: PropTypes.func,

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
