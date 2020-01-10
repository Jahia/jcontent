import React from 'react';
import {Snackbar, withStyles} from '@material-ui/core';
import {Typography} from '@jahia/design-system-kit';
import {Check} from '@material-ui/icons';
import {compose} from 'react-apollo';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';

let styles = theme => ({
    feedback: {
        padding: theme.spacing.unit * 2
    },
    feedbackContent: {
        display: 'flex'
    },
    feedbackIcon: {
        marginRight: theme.spacing.unit
    }
});

export const Feedback = ({open, messageKey, classes, onClose, t}) => (
    <Snackbar open={open}
              className={classes.feedback}
              autoHideDuration={2000}
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
              }}
              message={
                  <div className={classes.feedbackContent}>
                      <Check className={classes.feedbackIcon}/>
                      <Typography variant="zeta" color="invert">
                          {messageKey && t(messageKey.key ? messageKey.key : messageKey, messageKey.params)}
                      </Typography>
                  </div>
              }
              onClose={onClose}
            />
);

Feedback.propTypes = {
    classes: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    messageKey: PropTypes.string,
    onClose: PropTypes.func
};

export default compose(
    withTranslation(),
    withStyles(styles)
)(Feedback);
