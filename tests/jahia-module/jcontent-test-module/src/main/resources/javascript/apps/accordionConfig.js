window.jahia.i18n.loadNamespaces('accordion-config');

window.jahia.uiExtender.registry.add('callback', 'accordion-config', {
    targets: ['jahiaApp-init:60'],
    callback: function () {
        const pageAccordion = window.jahia.uiExtender.registry.get('accordionItem', 'pages');
        window.jahia.uiExtender.registry.add('accordionItem', 'accordion-config', pageAccordion, {
            targets: ['jcontent:998'],
            label: 'test1',
            icon: window.jahia.moonstone.toIconComponent('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6V5A2 2 0 0 0 17 3H15A2 2 0 0 0 13 5V6H11V5A2 2 0 0 0 9 3H7A2 2 0 0 0 5 5V6H3V20H21V6M19 18H5V8H19Z" /></svg>'),
            requireModuleInstalledOnSite: 'jcontent-test-module',
            isEnabled: function(siteKey) {
                return siteKey !== 'systemsite'
            }
        });
    }
});
