import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Add} from '@jahia/moonstone';
import {cmAddSelection} from '../../redux/selection.redux';

export const SelectionActionComponent = ({render: Render, ...others}) => {
    const dispatch = useDispatch();
    const {t} = useTranslation('jcontent');
    const selection = useSelector(state => state.jcontent.selection);

    if (!others.currentPath) {
        return false;
    }

    let buttonIcon = <Add/>;
    let buttonLabel = t('jcontent:label.contentManager.selection.addTo');
    let isTitle = false;
    let onClick = () => dispatch(cmAddSelection(others.currentPath));

    if (selection.length > 0 && selection.includes(others.currentPath)) {
        buttonIcon = null;
        buttonLabel = t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length});
        isTitle = true;
    }

    return (
        <Render
            {...others}
            isVisible
            enabled
            isTitle={isTitle}
            buttonIcon={buttonIcon}
            buttonLabel={buttonLabel}
            onClick={onClick}
        />
    );
};

SelectionActionComponent.propTypes = {
    render: PropTypes.func.isRequired
};
