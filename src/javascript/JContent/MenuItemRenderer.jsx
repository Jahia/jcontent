import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Typography} from '@jahia/design-system-kit';

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
        h = h || context.menuContext.inMenu;
    }

    return (
        context.enabled !== false &&
        <div style={{padding: '8 24', color: '#131C21', backgroundColor: h ? '#E0E6EA' : 'inherit'}}
             role="menuitem"
             onClick={onClick}
             onMouseEnter={onEnter}
             onMouseLeave={onLeave}
        >
            <Typography variant="zeta"
                        color="inherit"
                        dangerouslySetInnerHTML={{__html: t(context.buttonLabel, context.buttonLabelParams)}}/>
        </div>
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
    onMouseEnter: PropTypes.func.isRequired,
    /**
     * Function to call when the menu item is left
     */
    onMouseLeave: PropTypes.func.isRequired
};
