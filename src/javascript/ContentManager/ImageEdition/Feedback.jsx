import React from 'react';
import {Snackbar, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';

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

export default compose(
    withStyles(styles)
)(Feedback);
