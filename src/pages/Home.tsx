import { useApp } from '../context/AppContext';
import PostCard from '../components/PostCard';
import './Home.css';

export default function Home() {
  const { state, currentUser } = useApp();

  const publicPosts = state.posts
    .filter(p => p.visibility === 'public' || p.authorId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="home">
      <header className="page-header">
        <h1>🌈 发现</h1>
        <p className="page-header__sub">看看大家都在分享什么</p>
      </header>

      <div className="home__feed">
        {publicPosts.length === 0 ? (
          <div className="empty-state sketch-box">
            <span className="empty-state__emoji">📭</span>
            <p>还没有动态，快去发文吧！</p>
          </div>
        ) : (
          publicPosts.map((post, i) => (
            <div key={post.id} className="stagger-item" style={{ animationDelay: `${Math.min(i * 0.06, 0.36)}s` }}>
              <PostCard post={post} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
