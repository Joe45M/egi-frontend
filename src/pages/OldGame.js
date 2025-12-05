import { useParams, Navigate } from "react-router-dom";

// Redirect old URL structure: /game/:slug -> /games?game=:slug
function OldGame() {
  const { slug } = useParams();
  if (!slug) {
    return null;
  }
  return <Navigate to={`/games?game=${slug}`} replace />;
}

export default OldGame;

