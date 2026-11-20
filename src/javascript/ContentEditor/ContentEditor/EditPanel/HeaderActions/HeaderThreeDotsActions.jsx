import React, {useState} from 'react';
import {DisplayAction} from '@jahia/ui-extender';
import {Button, Menu, MoreVert} from '@jahia/moonstone';
import {MenuItemRenderer} from '~/JContent/MenuItemRenderer';
import {getButtonLimitValue, getMenuActions} from './utils.headerActions';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';

const HeaderThreeDotsActions = ({targetActionKey}) => {
    const {t} = useTranslation('jcontent');
    const menuContainerRef = React.useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const limit = getButtonLimitValue();
    const actionsToDisplay = getMenuActions(limit, 99, targetActionKey);

    if (actionsToDisplay.length === 0) {
        return null;
    }

    return (
        <div ref={menuContainerRef}>
            <Button
                variant="ghost"
                icon={<MoreVert/>}
                aria-label={t('jcontent:label.contentEditor.edit.action.moreOptions')}
                onClick={() => setAnchorEl(menuContainerRef)}
            />
            <Menu
                isDisplayed={Boolean(anchorEl)}
                anchorEl={anchorEl}
                transformElOrigin={{vertical: 'top', horizontal: 'right'}}
                onClose={() => setAnchorEl(null)}
            >
                {actionsToDisplay.map(actionKey => (
                    <DisplayAction
                        key={actionKey}
                        actionKey={actionKey}
                        render={MenuItemRenderer}
                        data-sel-role={`headerAction-${actionKey}`}
                    />
                ))}
            </Menu>
        </div>
    );
};

HeaderThreeDotsActions.propTypes = {
    targetActionKey: PropTypes.string
};

export default HeaderThreeDotsActions;
