package org.jahia.modules.contentmanager.configuration;

import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;

public class ContentManagerFilter extends AbstractFilter {

    @Override
    public String prepare(RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        if (renderContext.getServletPath().endsWith("/contentmanagerframe") && !"content-manager".equals(resource.getTemplate())) {
            JCRSiteNode site = resource.getNode().getResolveSite();
            Resource r = new Resource(site, "html", "content-manager", "page");
            return service.render(r, renderContext);
        }
        return null;
    }
}
