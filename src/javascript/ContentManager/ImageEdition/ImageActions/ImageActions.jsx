import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@jahia/ds-mui-theme';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

let styles = {
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        '& > button': {
            marginRight: '1em'
        }
    },
    spacer: {
        flex: 1
    }
};

const ImageActions = ({classes, t, undoChanges, saveChanges, dirty}) => (
    <div className={classes.buttons}>
        <Button variant="ghost" color="primary" disabled={!dirty} onClick={undoChanges}>
            {t('label.contentManager.editImage.undo')}
        </Button>
        <div className={classes.spacer}/>
        <Button variant="secondary" disabled={!dirty} onClick={() => saveChanges(true)}>
            {t('label.contentManager.editImage.saveAs')}
        </Button>
        <Button variant="primary" disabled={!dirty} onClick={() => saveChanges(false)}>
            {t('label.contentManager.editImage.save')}
        </Button>
    </div>
);

ImageActions.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    dirty: PropTypes.bool.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageActions);
