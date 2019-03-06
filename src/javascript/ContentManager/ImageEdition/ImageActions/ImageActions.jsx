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

const ImageActions = ({classes, t, undoChanges, saveChanges}) => (
    <div className={classes.buttons}>
        <Button variant="ghost" color="primary" onClick={undoChanges}>
            {t('label.contentManager.editImage.undo')}
        </Button>
        <div className={classes.spacer}/>
        <Button variant="secondary">
            {t('label.contentManager.editImage.saveAs')}
        </Button>
        <Button variant="normal" onClick={saveChanges}>
            {t('label.contentManager.editImage.save')}
        </Button>
    </div>
);

ImageActions.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageActions);
