import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Menu, MenuItem, Separator} from '@jahia/moonstone';

export const ServerNameMenu = ({anchorEl, serverNames, onSelect, onClose}) => {
    const {t} = useTranslation();
    const {serverName, serverNameAliases, selectedServerName, currentHostname} = serverNames;

    return (
        <Menu
            isDisplayed
            anchorEl={anchorEl}
            anchorElOrigin={{vertical: 'bottom', horizontal: 'left'}}
            transformElOrigin={{vertical: 'top', horizontal: 'left'}}
            onClose={onClose}
        >
            <MenuItem
                variant="title"
                label={t('jcontent:label.contentManager.actions.openInLiveDefaultDomain')}
            />
            <MenuItem
                label={serverName}
                isSelected={selectedServerName === serverName}
                onClick={() => onSelect(serverName)}
            />
            {serverNameAliases.length > 0 && (
                <>
                    <Separator/>
                    <MenuItem
                        variant="title"
                        label={t('jcontent:label.contentManager.actions.openInLiveAdditionalDomains')}
                    />
                    {serverNameAliases.map(alias => (
                        <MenuItem
                            key={alias}
                            label={alias}
                            isSelected={selectedServerName === alias}
                            onClick={() => onSelect(alias)}
                        />
                    ))}
                </>
            )}
            {currentHostname && (
                <>
                    <Separator/>
                    <MenuItem
                        variant="title"
                        label={t('jcontent:label.contentManager.actions.openInLiveCurrentDomain')}
                    />
                    <MenuItem
                        label={currentHostname}
                        onClick={() => onSelect(currentHostname)}
                    />
                </>
            )}
        </Menu>
    );
};

ServerNameMenu.propTypes = {
    anchorEl: PropTypes.object,
    serverNames: PropTypes.shape({
        serverName: PropTypes.string,
        serverNameAliases: PropTypes.arrayOf(PropTypes.string),
        selectedServerName: PropTypes.string,
        currentHostname: PropTypes.string
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};
