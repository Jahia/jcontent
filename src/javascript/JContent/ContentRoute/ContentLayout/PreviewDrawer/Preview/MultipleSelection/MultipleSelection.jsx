import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Paper} from '@material-ui/core';
import {Button, Typography} from '@jahia/design-system-kit';
import {ContentCopy} from 'mdi-material-ui';

const MultipleSelection = ({classes, t, selection, clearSelection}) => (
    <div className={classNames(classes.noPreviewContainer, classes.contentContainer)}>
        <Paper elevation={1} className={classes.contentContainer} classes={{root: classes.center}}>
            <Typography variant="gamma">
                {t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length})}
            </Typography>
            <ContentCopy className={classes.centerIcon} color="inherit"/>
            <Button onClick={clearSelection}>
                {t('jcontent:label.contentManager.selection.clearMultipleSelection')}
            </Button>
        </Paper>
    </div>
);

MultipleSelection.propTypes = {
    classes: PropTypes.object.isRequired,
    clearSelection: PropTypes.func.isRequired,
    selection: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired
};

export default MultipleSelection;
