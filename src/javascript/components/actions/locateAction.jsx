import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {cmSetMode, cmSetPath, cmOpenPaths, cmSetSelection} from "../redux/actions";
import {reduxAction} from "./reduxAction";
import Constants from "../constants";
import {of} from "rxjs";
import * as _ from "lodash";

export default composeActions(requirementsAction, reduxAction(null,(dispatch) => ({
    setMode: (state) => dispatch(cmSetMode(state)),
    setPath: (state)=> dispatch(cmSetPath(state)),
    setOpenPaths: (state)=> dispatch(cmOpenPaths(state)),
    setSelection: (state)=> dispatch(cmSetSelection(state)),
})), {
    init: (context) => {
      context.initRequirements({
          enabled: (context) => {return of(!_.isEmpty(context.locate))}
      });
    },
    onClick: (context) => {
        let {setMode, setPath, setOpenPaths, setSelection} = context;
        switch(context.locate.type) {
            case "jnt:page":
                let base = context.locate.paths[0].split("/");
                base.pop();
                context.locate.paths.splice(0,0, base.join("/"));
            case "jnt:contentFolder":
                setMode(Constants.mode.BROWSE);
                break;
            case "jnt:folder":
                setMode(Constants.mode.FILES);
                break;
        }
        setPath(context.locate.navigateToPath);
        setOpenPaths(context.locate.paths);
        setSelection([context.locate.node]);
    }
});