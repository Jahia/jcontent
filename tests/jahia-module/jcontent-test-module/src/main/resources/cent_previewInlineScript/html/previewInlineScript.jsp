<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%--
    Renders a static marker plus an inline <script> that would stamp the document if it ran.
    The preview frame shows rendered content as a static document, so the marker must appear
    while the stamp must not — see the jcontent preview Cypress spec.
--%>
<div data-testid="preview-inline-script-marker">previewInlineScript marker</div>
<script>
    document.documentElement.dataset.previewScriptRan = 'yes';
</script>
