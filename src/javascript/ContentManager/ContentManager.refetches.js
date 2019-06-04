import ContentManagerConstants from './ContentManager.constants';
import _ from 'lodash';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

/**
 * Apollo's Query component allows one to use refetch function to rerun a query bound to the component.
 * The purpose of this code is to be able to create hooks to refetch functions and call them outside of Query components.
 *
 * Note that calling refetch() will use the same query parameters as used for the last call, but you can also supply new
 * parameters if needed.
 */

const debouncer = (fn, delay) => {
    let s = new Subject();
    s.pipe(debounceTime(delay)).subscribe(fn);
    return () => {
        s.next({});
    };
};

const contentManagerRefetches = {};

const refetchTypes = {
    CONTENT_DATA: 'CONTENT_DATA',
    ACTIVE_WORKFLOW_TASKS: 'ACTIVE_WORKFLOW_TASKS'
};

let setRefetcher = (name, refetcherData) => {
    contentManagerRefetches[name] = refetcherData;
};

let setActiveWorkflowTaskRefetcher = refetcherData => {
    setRefetcher(refetchTypes.ACTIVE_WORKFLOW_TASKS, refetcherData);
};

let setContentListDataRefetcher = refetcherData => {
    setRefetcher(refetchTypes.CONTENT_DATA, refetcherData);
};

let triggerRefetch = (name, queryParams) => {
    let refetch = contentManagerRefetches[name];
    if (!refetch) {
        return;
    }

    if (queryParams) {
        refetch.refetch(queryParams);
    } else {
        refetch.refetch();
    }
};

let refetchActiveWorkflowTasks = debouncer(() => {
    triggerRefetch(refetchTypes.ACTIVE_WORKFLOW_TASKS);
}, 5000);

let refetchContentListData = () => {
    triggerRefetch(refetchTypes.CONTENT_DATA);
};

let refetchContentTreeData = contentTreeConfigs => {
    _.forOwn(contentTreeConfigs || ContentManagerConstants.contentTreeConfigs, function (cfg) {
        triggerRefetch(cfg.key);
    });
};

let refetchContentTreeAndListData = contentTreeConfigs => {
    refetchContentTreeData(contentTreeConfigs);
    refetchContentListData();
};

export {
    refetchTypes,

    setRefetcher,
    setActiveWorkflowTaskRefetcher,
    setContentListDataRefetcher,

    triggerRefetch,
    refetchActiveWorkflowTasks,
    refetchContentListData,
    refetchContentTreeData,
    refetchContentTreeAndListData
};
