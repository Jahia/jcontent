import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {MenuItem} from '@jahia/moonstone';

export let MenuItemRenderer = ({context, onClick, onMouseEnter, onMouseLeave}) => {
    const {t} = useTranslation();
    const [hover, setHover] = useState(false);

    const onEnter = e => {
        onMouseEnter(e);
        setHover(true);
    };

    const onLeave = e => {
        onMouseLeave(e);
        setHover(false);
    };

    let h = hover;
    if (context.menuContext) {
        h = h || context.menuState.isInMenu;
    }

    // eslint-disable-next-line react/no-danger
    const label = <span dangerouslySetInnerHTML={{__html: t(context.buttonLabel, context.buttonLabelParams)}}/>;

    return (
        <MenuItem
            data-sel-role={context.key}
            label={label}
            isHover={h}
            isDisabled={context.enabled === false}
            onClick={onClick}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        />
    );
};

MenuItemRenderer.propTypes = {
    /**
     * The action context
     */
    context: PropTypes.object.isRequired,
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
    onMouseLeave: PropTypes.func
};
