import {registry} from '@jahia/ui-extender';

registry.add('callback', 'jContent', {
    targets: ['jahiaApp-init:1'],
    callback: () => import('./JContent.register')
});
