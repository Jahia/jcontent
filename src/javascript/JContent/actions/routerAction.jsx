import {cmGoto} from '../JContent.redux';
import {composeActions} from '@jahia/react-material';
import {reduxAction} from './reduxAction';
import requirementsAction from './requirementsAction';

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

        setUrl(siteKey, language, mode, path, context.urlParams ? context.urlParams : {});
        return null;
    }
});

export {routerAction};
