import mdb from "../markdowndb.json";
import PostInfo from './post-info'
export default function Posts(props) {
  const allPosts = mdb.filter((p) => p.metadata.type === "post");

  // sort by date desc
  const allPostsSorted = allPosts.sort((a, b) => {
    return new Date(b.metadata.date) - new Date(a.metadata.date);
  })


  return (
    <div className="flex flex-col">
      {allPostsSorted.map((post, index) => (
        // add margin-bottom but not in last child
        <div key={index} className="mb-8 last:mb-0">
          <details open className="flex">
            <summary>
              <a href={`/posts/${getPostSlug(post)}`} className="vocs_Anchor">{post.metadata.title}</a>
            </summary>

            <div className="pl-4 pt-4 opacity-50">
            <PostInfo date={post.metadata.date} views={post.metadata.views} />
            </div>

            <div className="pl-4 pt-2">
            <span className="opacity-50">{post.metadata.description}</span>
            </div>
          </details>
        </div>
      ))}{" "}
    </div>
  );
}

const getPostSlug = (post) => {
    const fileName = post.file_path.split("/").pop();
    const slug = fileName.replace(/.md|x/ig, "");
    return slug;
}