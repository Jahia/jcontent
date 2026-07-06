import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Button, ButtonGroup, ChevronDown, OpenInNew} from '@jahia/moonstone';
import {useOpenInLiveData} from './useOpenInLiveData';
import {ServerNameMenu} from './ServerNameMenu';
import {resolveUrlForLiveOrPreview} from '~/JContent/JContent.utils';
import styles from '../MainActionBar.scss';

export const OpenInLiveButtonGroup = ({path, isDisabled}) => {
    const {t} = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const {liveData, selectedServerName, selectServerName} = useOpenInLiveData(path);

    if (!liveData) {
        return null;
    }

    const {urlPath, serverName, serverNameAliases, currentHostname} = liveData;

    const handleOpen = () => {
        const url = resolveUrlForLiveOrPreview(urlPath, true, selectedServerName || serverName);
        window.open(url, '_blank');
    };

    const handleChevronClick = e => {
        setAnchorEl(e.currentTarget);
        setIsMenuOpen(open => !open);
    };

    const handleSelectServerName = name => {
        selectServerName(name);
        const url = resolveUrlForLiveOrPreview(urlPath, true, name);
        window.open(url, '_blank');
        setIsMenuOpen(false);
    };

    return (
        <>
            <ButtonGroup size="big" variant="outlined" color="accent" className={styles.item}>
                <Button
                    label={t('jcontent:label.contentManager.actions.openInLive')}
                    icon={<OpenInNew/>}
                    isDisabled={isDisabled}
                    onClick={handleOpen}
                />
                <Button
                    icon={<ChevronDown/>}
                    isDisabled={isDisabled}
                    aria-label={t('jcontent:label.contentManager.actions.openInLive')}
                    onClick={handleChevronClick}
                />
            </ButtonGroup>
            {isMenuOpen && (
                <ServerNameMenu
                    anchorEl={anchorEl}
                    serverNames={{serverName, serverNameAliases, selectedServerName, currentHostname}}
                    onSelect={handleSelectServerName}
                    onClose={() => setIsMenuOpen(false)}
                />
            )}
        </>
    );
};

OpenInLiveButtonGroup.propTypes = {
    path: PropTypes.string,
    isDisabled: PropTypes.bool
};
