import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addPost, deletePost, fetchPosts, likePost, unlikePost } from '../features/postsSlice';
import { dayMonthYear } from '../format';

function PostItem({ post }) {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.auth.user);
  const liked = post.likes.some((l) => l.user === me?.id);
  return (
    <li className="card post">
      <img src={post.avatar} alt="" width="48" height="48" loading="lazy" />
      <div>
        <strong><Link to={`/profile/${post.user}`}>{post.name}</Link></strong>
        <span className="muted"> {dayMonthYear(post.date)}</span>
        <p>{post.text}</p>
        <div className="row wrap">
          <button type="button" className={`btn small ${liked ? 'on' : ''}`} aria-pressed={liked}
                  onClick={() => dispatch((liked ? unlikePost : likePost)(post._id))}>
            {liked ? 'Liked' : 'Like'} ({post.likes.length})
          </button>
          <Link className="btn small" to={`/posts/${post._id}`}>Comments ({post.comments.length})</Link>
          {post.user === me?.id && (
            <button type="button" className="btn small danger" onClick={() => dispatch(deletePost(post._id))}>Delete</button>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Posts() {
  const dispatch = useDispatch();
  const { items, loaded } = useSelector((s) => s.posts);
  const [text, setText] = useState('');

  useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    const action = await dispatch(addPost(text));
    if (action.meta.requestStatus === 'fulfilled') setText('');
  };

  return (
    <>
      <h1>Posts</h1>
      <form className="card form" onSubmit={submit}>
        <label>
          Share something with the community
          <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} required />
        </label>
        <button className="btn primary" disabled={!text.trim()}>Post</button>
      </form>
      {!loaded ? <p className="muted">Loading posts…</p> : items.length === 0 ? (
        <p className="muted">Nothing here yet. Write the first post.</p>
      ) : (
        <ul className="list">{items.map((p) => <PostItem key={p._id} post={p} />)}</ul>
      )}
    </>
  );
}
