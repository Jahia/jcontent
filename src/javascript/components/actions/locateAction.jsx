import {composeActions} from "@jahia/react-material";
import requirementsAction from "./requirementsAction";
import {cmSetMode, cmSetPath, cmOpenPaths, cmSetSelection} from "../redux/actions";
import {reduxAction} from "./reduxAction";
import Constants from "../constants";
import {of} from "rxjs";
import * as _ from "lodash";
import {FindParentQuery} from '../gqlQueries';

export default composeActions(requirementsAction, reduxAction((state)=> ({mode:state.mode}),(dispatch) => ({
    setMode: (state) => dispatch(cmSetMode(state)),
    setPath: (state)=> dispatch(cmSetPath(state)),
    setOpenPaths: (state)=> dispatch(cmOpenPaths(state)),
    setSelection: (state)=> dispatch(cmSetSelection(state)),
})), {
    init: (context) => {
      context.initRequirements({
          enabled: (context) => of(context.mode === 'search')
      });
    },
    onClick: (context) => {
        context.client.watchQuery({query:FindParentQuery, variables:{path:context.path}}).subscribe(res=> {
            let n = res.data.jcr.nodeByPath;
            if (!_.isEmpty(n.parents)) {
                let parent = n.parents[n.parents.length-1];
                let paths = [];
                _.each(n.parents, (parent)=>{
                    paths.push(parent.path);
                });
                let locate = {
                    node: n,
                    paths: paths,
                    navigateToPath:parent.path,
                    type:parent.type.value
                };
                let {setMode, setPath, setOpenPaths, setSelection} = context;
                switch (locate.type) {
                    case "jnt:page":
                        let base = locate.paths[0].split("/");
                        base.pop();
                        locate.paths.splice(0, 0, base.join("/"));
                    case "jnt:contentFolder":
                        setMode(Constants.mode.BROWSE);
                        break;
                    case "jnt:folder":
                        setMode(Constants.mode.FILES);
                        break;
                }
                setPath(locate.navigateToPath);
                setOpenPaths(locate.paths);
                setSelection([locate.node]);
            }
        });
    }
});