import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Twitter, 
  Facebook, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronRight, 
  Calendar,
  User,
  ArrowLeft
} from 'lucide-react';

// --- CONFIGURATION START ---
// Edit these details to customize your website

const PERSONAL_INFO = {
  name: "Atish Ak Sharma",
  title: "Explorer & Developer",
  email: "atishaksharma@gmail.com",
  location: "World Traveler",
  bio: "I am a passionate creator who loves building interactive experiences and exploring the world. Welcome to my digital garden where I share my thoughts on tech, travel, and life.",
  socials: {
    github: "https://github.com/atishsharma",
    twitter: "https://twitter.com/atishaksharma",
    facebook: "https://facebook.com/atishaksharma",
  }
};

// Add or remove blog posts here. 
// Images are from Unsplash. You can replace the URLs with your own.
const BLOG_POSTS = [
  {
    id: 1,
    title: "The Serenity of High Altitudes",
    excerpt: "Why mountain climbing teaches you more about patience than code ever could.",
    content: "There is a silence in the mountains that you cannot find anywhere else. Last summer, I took a trip to the Alps...",
    date: "October 12, 2023",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Coding from a Coffee Shop in Tokyo",
    excerpt: "The productivity boost of changing your environment and embracing the noise.",
    content: "Tokyo is a city of contrasts. The neon lights and the quiet shrines. I found a small cafe in Shibuya...",
    date: "November 05, 2023",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1554797589-7241bb691973?auto=format&fit=crop&q=80&w=1000",
    readTime: "3 min read"
  },
  {
    id: 3,
    title: "Minimalism in Digital Design",
    excerpt: "How reducing clutter improves user experience and mental clarity.",
    content: "We often think more is better. More features, more buttons, more colors. But the best interfaces are invisible...",
    date: "December 01, 2023",
    category: "Tech",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000",
    readTime: "7 min read"
  },
  {
    id: 4,
    title: "Sunset Chasing: A Photographer's Guide",
    excerpt: "Finding the perfect light in the most unexpected places.",
    content: "Golden hour is brief, but magic. Here are my top tips for capturing that fleeting moment before the sun dips below the horizon...",
    date: "January 15, 2024",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1000",
    readTime: "4 min read"
  }
];

// --- CONFIGURATION END ---

const NavLink = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-white text-black font-medium shadow-lg' 
        : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const SocialIcon = ({ Icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="p-3 bg-white/5 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 border border-white/10"
  >
    <Icon size={20} className="text-white" />
  </a>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setSelectedPost(null);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPost = (post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- VIEWS ---

  const HomeView = () => (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000")',
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-16">
          <h2 className="text-xl md:text-2xl font-light text-blue-300 mb-4 tracking-widest uppercase">
            {PERSONAL_INFO.title}
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
            Hi, I'm {PERSONAL_INFO.name}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            {PERSONAL_INFO.bio}
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <SocialIcon Icon={Github} href={PERSONAL_INFO.socials.github} label="GitHub" />
            <SocialIcon Icon={Twitter} href={PERSONAL_INFO.socials.twitter} label="Twitter" />
            <SocialIcon Icon={Facebook} href={PERSONAL_INFO.socials.facebook} label="Facebook" />
            <SocialIcon Icon={Mail} href={`mailto:${PERSONAL_INFO.email}`} label="Email" />
          </div>

          <button 
            onClick={() => navigateTo('blog')}
            className="group relative px-8 py-3 bg-blue-600 text-white font-medium rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:bg-blue-500"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore My Blog <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* Featured Preview Section */}
      <div className="py-20 px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Latest Adventures</h3>
              <p className="text-slate-400">Snippets from my recent travels and thoughts.</p>
            </div>
            <button 
              onClick={() => navigateTo('blog')} 
              className="hidden md:flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all <ArrowLeft size={16} className="rotate-180 ml-2" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <div 
                key={post.id}
                onClick={() => { navigateTo('blog'); openPost(post); }}
                className="group cursor-pointer bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-3">
                    <span className="bg-blue-500/10 px-2 py-1 rounded">{post.category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">{post.readTime}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const BlogView = () => (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {selectedPost ? (
          // Single Post View
          <div className="max-w-3xl mx-auto animate-slide-up">
            <button 
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors group"
            >
              <div className="p-2 rounded-full bg-slate-900 group-hover:bg-slate-800 mr-2 transition-colors">
                <ArrowLeft size={20} />
              </div>
              Back to posts
            </button>
            
            <div className="relative h-[400px] w-full rounded-3xl overflow-hidden mb-10 shadow-2xl">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <div className="flex items-center gap-3 text-sm text-blue-300 mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-500/20">
                    {selectedPost.category}
                  </span>
                  <span>{selectedPost.date}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {selectedPost.title}
                </h1>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
              {/* Simulating rich text content */}
              <p className="text-xl text-slate-200 font-light mb-8 border-l-4 border-blue-500 pl-4 italic">
                {selectedPost.excerpt}
              </p>
              {selectedPost.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6">{paragraph}</p>
              ))}
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h3 className="text-2xl font-bold text-white mt-12 mb-6">The Journey Continues</h3>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            
            <div className="mt-16 pt-8 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                  👋
                </div>
                <div>
                  <p className="text-white font-medium">Written by {PERSONAL_INFO.name}</p>
                  <p className="text-slate-500 text-sm">{PERSONAL_INFO.title}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></button>
              </div>
            </div>
          </div>
        ) : (
          // Blog Grid View
          <>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Journal</h2>
              <p className="text-slate-400 text-lg">
                Thoughts, stories, and ideas from my travels and work.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
              {BLOG_POSTS.map((post) => (
                <article 
                  key={post.id}
                  onClick={() => openPost(post)}
                  className="group cursor-pointer flex flex-col h-full bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all hover:border-slate-700"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                      <Calendar size={14} />
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 mb-6 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform">
                      Read Article <ChevronRight size={16} className="ml-1" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const AboutView = () => (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3 sticky top-32">
            <div className="aspect-square rounded-3xl overflow-hidden mb-6 border-2 border-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <SocialIcon Icon={Github} href={PERSONAL_INFO.socials.github} label="GitHub" />
              <SocialIcon Icon={Twitter} href={PERSONAL_INFO.socials.twitter} label="Twitter" />
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Explorer. <br/>
              <span className="text-blue-500">Developer.</span> <br/>
              Storyteller.
            </h1>
            
            <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
              <p>
                Hello! I'm {PERSONAL_INFO.name}. I've always believed that the best code is written with a clear mind, and the best inspiration comes from stepping away from the screen and into the world.
              </p>
              <p>
                Based in {PERSONAL_INFO.location}, I specialize in building modern web experiences. When I'm not debugging, you can find me hiking up a mountain or capturing moments with my camera.
              </p>
              <p>
                I created this space to document my journey. Whether it's a technical deep-dive or a travel log from a remote village, I hope you find something that resonates with you.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                <User className="text-blue-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">My Work</h3>
                <p className="text-slate-400">
                  Building scalable applications and intuitive interfaces.
                </p>
              </div>
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                <MapPin className="text-green-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">My Travels</h3>
                <p className="text-slate-400">
                  30+ countries visited and counting. Always seeking new horizons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ContactView = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 animate-fade-in py-24">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-12 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-6">Let's Connect</h2>
            <p className="text-slate-400 mb-8">
              Have a project in mind or just want to say hi? I'm always open to new opportunities and interesting conversations.
            </p>
            
            <div className="space-y-6">
              <a href={`mailto:${PERSONAL_INFO.email}`} className="flex items-center gap-4 text-slate-300 hover:text-blue-400 transition-colors">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <span className="text-lg">{PERSONAL_INFO.email}</span>
              </a>
              <a href={PERSONAL_INFO.socials.twitter} className="flex items-center gap-4 text-slate-300 hover:text-blue-400 transition-colors">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Twitter size={20} />
                </div>
                <span className="text-lg">@atishaksharma</span>
              </a>
              <a href={PERSONAL_INFO.socials.facebook} className="flex items-center gap-4 text-slate-300 hover:text-blue-400 transition-colors">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Facebook size={20} />
                </div>
                <span className="text-lg">Atish Ak Sharma</span>
              </a>
            </div>
          </div>
          
          <div className="relative h-64 md:h-auto">
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000" 
              alt="Contact" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/80 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div 
            onClick={() => navigateTo('home')} 
            className="text-2xl font-bold text-white cursor-pointer tracking-tighter"
          >
            ATISH<span className="text-blue-500">.</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1 rounded-full border border-white/5 backdrop-blur-sm">
            <NavLink active={activeTab === 'home'} onClick={() => navigateTo('home')}>Home</NavLink>
            <NavLink active={activeTab === 'blog'} onClick={() => navigateTo('blog')}>Journal</NavLink>
            <NavLink active={activeTab === 'about'} onClick={() => navigateTo('about')}>About</NavLink>
            <NavLink active={activeTab === 'contact'} onClick={() => navigateTo('contact')}>Contact</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-center text-2xl font-medium">
            <button onClick={() => navigateTo('home')} className="py-4 hover:text-blue-400">Home</button>
            <button onClick={() => navigateTo('blog')} className="py-4 hover:text-blue-400">Journal</button>
            <button onClick={() => navigateTo('about')} className="py-4 hover:text-blue-400">About</button>
            <button onClick={() => navigateTo('contact')} className="py-4 hover:text-blue-400">Contact</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main>
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'blog' && <BlogView />}
        {activeTab === 'about' && <AboutView />}
        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {PERSONAL_INFO.name}. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href={PERSONAL_INFO.socials.github} className="text-slate-400 hover:text-white transition-colors"><Github size={20} /></a>
            <a href={PERSONAL_INFO.socials.twitter} className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href={PERSONAL_INFO.socials.facebook} className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
          </div>
        </div>
      </footer>

      {/* Styles for simple animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
