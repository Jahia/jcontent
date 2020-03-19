import React, {useState} from 'react';
import SearchDialog from './SearchDialog';
import PropTypes from 'prop-types';
import {useNodeChecks} from '@jahia/data-helper';

export const SearchActionComponent = ({context, render: Render, loading: Loading}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const res = useNodeChecks(
        {path: context.path},
        {
            ...context
        }
    );

    if (res.loading && Loading) {
        return <Loading context={context}/>;
    }

    if (!res.node) {
        return false;
    }

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    return (
        <>
            <Render context={{
                ...context,
                isVisible: res.checksResult,
                onClick: () => {
                    setIsDialogOpen(true);
                }
            }}/>
            <SearchDialog isOpen={isDialogOpen} handleClose={() => handleClose()}/>
        </>
    );
};

SearchActionComponent.propTypes = {
    context: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

const searchAction = {
    component: SearchActionComponent
};

export default searchAction;
