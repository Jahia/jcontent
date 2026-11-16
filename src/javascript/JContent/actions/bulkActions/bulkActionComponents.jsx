import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import {BulkValuesDialog} from './BulkValuesDialog/BulkValuesDialog';
import {BulkReplaceValueDialog} from './BulkReplaceValueDialog/BulkReplaceValueDialog';

const DIALOG_KEY = 'bulkActionDialog';
const CHECK_OPTIONS = ['requiredPermission', 'requiredSitePermission', 'showOnNodeTypes', 'hideOnNodeTypes', 'requireModuleInstalledOnSite', 'showForPaths', 'hideForPaths'];

// The menu passes the context of its caller to every entry, so only the check options go to useNodeChecks.
export const checkOptions = props => Object.fromEntries(CHECK_OPTIONS.filter(key => props[key] !== undefined).map(key => [key, props[key]]));

const useBulkAction = ({path, paths, others, Dialog, dialogProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks({path, paths}, checkOptions(others));
    const selection = paths || (path ? [path] : []);

    const onClick = () => {
        const close = () => componentRenderer.destroy(DIALOG_KEY);
        componentRenderer.render(DIALOG_KEY, Dialog, {...dialogProps, isOpen: true, paths: selection, onClose: close});
    };

    return {res, onClick};
};

const BulkActionComponent = ({path, paths, render: Render, loading: Loading, Dialog, dialogProps, ...others}) => {
    const {res, onClick} = useBulkAction({path, paths, others, Dialog, dialogProps});

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    return <Render {...others} isVisible={res.checksResult} onClick={onClick}/>;
};

BulkActionComponent.propTypes = {
    path: PropTypes.string,
    paths: PropTypes.arrayOf(PropTypes.string),
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    Dialog: PropTypes.elementType.isRequired,
    dialogProps: PropTypes.object
};

export const BulkValuesActionComponent = ({bulkField, ...props}) => (
    <BulkActionComponent {...props} Dialog={BulkValuesDialog} dialogProps={{fieldKey: bulkField}}/>
);

BulkValuesActionComponent.propTypes = {
    bulkField: PropTypes.string.isRequired
};

export const BulkReplaceValueActionComponent = props => (
    <BulkActionComponent {...props} Dialog={BulkReplaceValueDialog}/>
);
