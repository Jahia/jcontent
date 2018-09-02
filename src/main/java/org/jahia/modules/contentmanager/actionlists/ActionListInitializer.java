package org.jahia.modules.contentmanager.actionlists;

import org.eclipse.gemini.blueprint.context.BundleContextAware;
import org.jahia.services.templates.JahiaTemplateManagerService;
import org.osgi.framework.BundleContext;
import org.springframework.beans.factory.InitializingBean;

public class ActionListInitializer implements InitializingBean, BundleContextAware {

    private BundleContext bundleContext;
    private JahiaTemplateManagerService jahiaTemplateManagerService;

    @Override
    public void setBundleContext(BundleContext bundleContext) {
        this.bundleContext = bundleContext;
    }

    public void setJahiaTemplateManagerService(JahiaTemplateManagerService jahiaTemplateManagerService) {
        this.jahiaTemplateManagerService = jahiaTemplateManagerService;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        TagFunctions.setBundleContext(bundleContext);
        TagFunctions.setJahiaTemplateManagerService(jahiaTemplateManagerService);
    }

}
