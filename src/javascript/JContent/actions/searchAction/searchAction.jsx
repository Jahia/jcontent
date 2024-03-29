import React, {useState} from 'react';
import SearchDialog from './SearchDialog';
import PropTypes from 'prop-types';

export const SearchActionComponent = ({render: Render, ...others}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <Render
                {...others}
                onClick={() => {
                    setIsDialogOpen(true);
                }}
            />
            <SearchDialog isOpen={isDialogOpen} handleClose={handleClose} {...others}/>
        </>
    );
};

SearchActionComponent.propTypes = {
    render: PropTypes.func.isRequired
};
