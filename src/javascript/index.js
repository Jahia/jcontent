import {registry} from '@jahia/ui-extender';

registry.add('callback', 'jContent', {
    targets: ['jahiaApp-init:1'],
    callback: () => Promise.all([
        import('./JContent.register'),
        window.jahia.i18n.loadNamespaces('jcontent')
    ])
});
