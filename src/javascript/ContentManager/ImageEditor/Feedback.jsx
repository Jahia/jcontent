import React from 'react';
import {Snackbar, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import PropTypes from 'prop-types';

let styles = theme => ({
    feedback: {
        padding: theme.spacing.unit * 2
    }
});

export const Feedback = ({open, message, classes, duration, onClose}) => (
    <Snackbar open={open}
              className={classes.feedback}
              autoHideDuration={duration}
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
              }}
              message={message}
              onClose={onClose}
            />
);

Feedback.propTypes = {
    open: PropTypes.bool.isRequired,
    message: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    duration: PropTypes.number,
    onClose: PropTypes.func
};

export default compose(
    withStyles(styles)
)(Feedback);
