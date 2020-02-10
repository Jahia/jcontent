import {cmGoto} from '../JContent.redux';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from './reduxAction';
import requirementsAction from './requirementsAction';
import JContentConstants from '../JContent.constants';

const mapDispatchToProps = dispatch => ({
    setUrl: (site, language, mode, path, params) => dispatch(cmGoto({site, language, mode, path, params}))
});

const mapStateToProps = state => ({
    language: state.language,
    siteKey: state.site
});

let routerAction = composeActions(requirementsAction, reduxAction(mapStateToProps, mapDispatchToProps), {
    init: context => {
        context.initRequirements();
    },

    onClick: context => {
        const {mode, siteKey, language, setUrl, path} = context;

        if (mode !== JContentConstants.mode.APPS && context.drawer && context.drawer.handleDrawerClose) {
            context.drawer.handleDrawerClose();
        }

        let resolvedPath = '';
        if (mode === JContentConstants.mode.APPS) {
            resolvedPath = context.actionPath ? context.actionPath : context.actionKey;
        } else {
            resolvedPath = path;
        }

        setUrl(siteKey, language, mode, resolvedPath, context.urlParams ? context.urlParams : {});
        return null;
    }
});

export {routerAction};
