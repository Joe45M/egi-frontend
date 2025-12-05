import { useParams, Navigate } from "react-router-dom";

// Redirect old URL structure with trailing slash: /game/:slug/ -> /games?game=:slug
function OldGameRedirect() {
  const { slug } = useParams();
  if (!slug) {
    return null;
  }
  return <Navigate to={`/games?game=${slug}`} replace />;
}

export default OldGameRedirect;

