import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import ResizingHandleIcon from './ResizingHandleIcon';

const useStyles = makeStyles({
    iconContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100%',
        minWidth: '100%'
    }
});

const ResizingHandleBar = React.forwardRef(({className, onMouseDown}, ref) => {
    const classes = useStyles();
    return (
        <div ref={ref} className={className} onMouseDown={onMouseDown}>
            <div className={classes.iconContainer}>
                <ResizingHandleIcon/>
            </div>
        </div>
    );
});

ResizingHandleBar.propTypes = {
    className: PropTypes.string.isRequired,
    onMouseDown: PropTypes.func.isRequired
};

export default ResizingHandleBar;
