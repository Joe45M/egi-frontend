import { useParams, Navigate } from "react-router-dom";

// Redirect component for old URL structure with trailing slash: /game/:slug/ -> /game/:slug
function OldGameRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/game/${slug}`} replace />;
}

export default OldGameRedirect;

