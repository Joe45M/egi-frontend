import { useParams, Navigate } from "react-router-dom";

// Redirect old WordPress tag URL structure: /tag/:slug -> /tags/:slug
function OldTagRedirect() {
  const { slug } = useParams();
  if (!slug) {
    return <Navigate to="/tags" replace />;
  }
  return <Navigate to={`/tags/${slug}`} replace />;
}

export default OldTagRedirect;
