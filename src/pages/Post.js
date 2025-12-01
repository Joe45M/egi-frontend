function Post() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Page</h1>
        <p className="text-gray-600 text-lg mb-4">
          This is the Post page. Here you can view and manage posts.
        </p>
        <div className="mt-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Sample Post</h2>
            <p className="text-gray-600">
              This is a sample post content. You can customize this page to display your posts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;

