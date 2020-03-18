import React, {useState} from 'react';
import SearchDialog from './SearchDialog';
import PropTypes from 'prop-types';

const SearchActionComponent = ({context, render: Render}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <Render context={{
                ...context,
                onClick: () => {
                    setIsDialogOpen(true);
                }
            }}/>
            <SearchDialog open={isDialogOpen} handleClose={() => handleClose()}/>
        </>
    );
};

SearchActionComponent.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired
};

const searchAction = {
    component: SearchActionComponent
};

export default searchAction;
