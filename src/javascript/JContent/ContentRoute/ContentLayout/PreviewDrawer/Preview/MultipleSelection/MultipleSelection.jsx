import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {ContentCopy} from 'mdi-material-ui';
import {useDispatch} from 'react-redux';
import {cmClearSelection} from '../../../contentSelection.redux';
import {useTranslation} from 'react-i18next';
import {Button, Typography} from '@jahia/moonstone';

const MultipleSelection = ({classes, selection}) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    return (
        <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
            <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
                <Typography variant="heading" weight="light">
                    {t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length})}
                </Typography>
                <ContentCopy className={classes.centerIcon} color="inherit"/>
                <Button className={classes.centerIcon} label={t('jcontent:label.contentManager.selection.clearMultipleSelection')} onClick={() => dispatch(cmClearSelection())}/>
            </Paper>
        </div>
    );
};

MultipleSelection.propTypes = {
    classes: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired
};

export default MultipleSelection;
