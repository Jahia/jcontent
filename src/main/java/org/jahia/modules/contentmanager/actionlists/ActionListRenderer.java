package org.jahia.modules.contentmanager.actionlists;

import org.jahia.services.render.RenderContext;

/**
 * An action list renderer is responsible for generating the output in the JSP for generating
 * custom action list that can then be used in the UI.
 */
public interface ActionListRenderer {

    String renderActionList(RenderContext renderContext);

}
