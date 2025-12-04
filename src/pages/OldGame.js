import PostDetail from "../components/PostDetail";

// Component for old URL structure: /game/:slug
function OldGame() {
  return <PostDetail postType="games" basePath="/game" />;
}

export default OldGame;

