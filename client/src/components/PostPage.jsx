import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { addComment, deleteComment, fetchPost } from '../features/postsSlice';
import { dayMonthYear } from '../format';

export default function PostPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: post, currentLoaded } = useSelector((s) => s.posts);
  const me = useSelector((s) => s.auth.user);
  const [text, setText] = useState('');

  useEffect(() => { dispatch(fetchPost(id)); }, [dispatch, id]);

  const submit = async (e) => {
    e.preventDefault();
    const action = await dispatch(addComment({ id, text }));
    if (action.meta.requestStatus === 'fulfilled') setText('');
  };

  if (!currentLoaded) return <p className="muted">Loading…</p>;
  if (!post) return <p>This post no longer exists. <Link to="/posts">Back to posts</Link></p>;
  return (
    <>
      <p><Link to="/posts">Back to posts</Link></p>
      <article className="card post">
        <img src={post.avatar} alt="" width="48" height="48" />
        <div>
          <strong><Link to={`/profile/${post.user}`}>{post.name}</Link></strong>
          <span className="muted"> {dayMonthYear(post.date)}</span>
          <p>{post.text}</p>
        </div>
      </article>
      <form className="card form" onSubmit={submit}>
        <label>Leave a comment<textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} required /></label>
        <button className="btn primary" disabled={!text.trim()}>Comment</button>
      </form>
      <h2>Comments ({post.comments.length})</h2>
      <ul className="list">
        {post.comments.map((c) => (
          <li key={c._id} className="card post">
            <img src={c.avatar} alt="" width="40" height="40" loading="lazy" />
            <div>
              <strong>{c.name}</strong><span className="muted"> {dayMonthYear(c.date)}</span>
              <p>{c.text}</p>
              {(c.user === me?.id || post.user === me?.id) && (
                <button type="button" className="btn small danger" onClick={() => dispatch(deleteComment({ id, commentId: c._id }))}>Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
