import {Subject} from 'rxjs';

export default {
    init: context => {
        context.obs = {open: new Subject(false)};
        context.open = context.obs.open;
    },

    onClick: context => {
        context.obs.open.next(!context.open);
    }
};
