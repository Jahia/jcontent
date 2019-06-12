import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {lodash as _} from 'lodash';
import {Menu, MenuItem} from '@material-ui/core';
import {Button, Typography} from '@jahia/design-system-kit';
import {ChevronDown} from 'mdi-material-ui';

export const LanguageSwitcherDisplay = ({lang, languages, onSelectLanguage}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const uppercaseFirst = string => {
        return string.charAt(0).toUpperCase() + string.substr(1);
    };

    return (
        <React.Fragment>
            {languages.length > 1 ? (
                <React.Fragment>
                    <Button aria-owns={anchorEl ? 'language-switcher' : null}
                            aria-haspopup="true"
                            data-cm-role="language-switcher"
                            size="compact"
                            color="inverted"
                            onClick={handleClick}
                    >
                        <Typography noWrap variant="zeta" color="inherit">
                            {uppercaseFirst(_.find(languages, language => language.language === lang).displayName)}
                            &nbsp;
                        </Typography>
                        <ChevronDown fontSize="small" color="inherit"/>
                    </Button>
                    <Menu id="language-switcher"
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                    >
                        {languages.map(lang => {
                            return (
                                <MenuItem
                                    key={lang.language}
                                    onClick={() => {
                                        onSelectLanguage(lang.language);
                                        handleClose();
                                    }}
                                >
                                    {uppercaseFirst(lang.displayName)}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Button aria-owns={anchorEl ? 'language-switcher' : null}
                            aria-haspopup="true"
                            data-cm-role="language-switcher"
                            size="compact"
                            color="inverted"
                            onClick={handleClick}
                    >
                        <Typography noWrap variant="zeta" color="inherit">
                            {uppercaseFirst(_.find(languages, language => language.language === lang).displayName)}
                            &nbsp;
                        </Typography>
                    </Button>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

LanguageSwitcherDisplay.propTypes = {
    lang: PropTypes.string.isRequired,
    languages: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectLanguage: PropTypes.func.isRequired
};

export default LanguageSwitcherDisplay;

