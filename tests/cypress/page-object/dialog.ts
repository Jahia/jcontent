import {BaseComponent} from "@jahia/cypress";

export class Dialog extends BaseComponent{
    static defaultSelector = '[role="dialog"]:not([aria-hidden="true"])';
}
