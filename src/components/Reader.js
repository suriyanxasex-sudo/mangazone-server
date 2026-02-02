import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader, MessageSquare, Send } from "lucide-react";
import { MANGADEX_URL, API_URL, ImageWithFallback, timeAgo } from "../utils";

export default function Reader({ manga, chapterToStart, onClose, onSaveHistory }) {
    const [view, setView] = useState("list");
    const [chapters, setChapters] = useState([]);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [comments, setComments] = useState([]); // 🔥 คอมเมนต์
    const [newComment, setNewComment] = useState("");
    const [user] = useState(JSON.parse(localStorage.getItem("mangaAppUser")));

    useEffect(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          // Load Chapters
          const search = await axios.get(`${MANGADEX_URL}/manga`, { params: { title: manga.title, limit: 1 } });
          if (search.data.data.length) {
              const dexId = search.data.data[0].id;
              const feed = await axios.get(`${MANGADEX_URL}/manga/${dexId}/feed`, { params: { translatedLanguage: ["th", "en"], limit: 300, order: { chapter: "asc" } } });
              const list = feed.data.data.filter(c => c.attributes.chapter).map(c => ({ id: c.id, ch: Number(c.attributes.chapter), lang: c.attributes.translatedLanguage })).sort((a, b) => a.ch - b.ch);
              setChapters(list);
              if (chapterToStart) { const found = list.find(c => c.id === chapterToStart.chapterId) || list.find(c => c.ch === chapterToStart.chapterCh); if(found) openChapter(found); }
          }
          // Load Comments
          const comms = await axios.get(`${API_URL}/comments/${manga.mal_id}`);
          setComments(comms.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
      };
      loadData();
    }, [manga]);
  
    const openChapter = async (chapter) => {
      setView("read"); setLoading(true); setPages([]); setCurrentChapter(chapter);
      onSaveHistory(manga, chapter);
      try {
        const res = await axios.get(`${MANGADEX_URL}/at-home/server/${chapter.id}`);
        setPages(res.data.chapter.data.map(f => `${res.data.baseUrl}/data/${res.data.chapter.hash}/${f}`));
      } catch (err) { alert("Error loading images"); } finally { setLoading(false); }
    };

    const submitComment = async (e) => {
        e.preventDefault(); if(!newComment.trim()) return;
        try {
            const res = await axios.post(`${API_URL}/comments`, { mangaId: manga.mal_id, username: user.username, message: newComment, avatar: user.avatar });
            setComments([res.data, ...comments]); setNewComment("");
        } catch(e) {}
    };
  
    const changeChapter = (dir) => {
        const idx = chapters.findIndex(c => c.id === currentChapter.id);
        if (chapters[idx + dir]) { openChapter(chapters[idx + dir]); window.scrollTo(0,0); } else { alert("No more chapters"); }
    };
  
    return (
      <div className="fixed inset-0 bg-[#121212] z-[100] flex flex-col animate-fade-in text-white">
        <div className="h-14 bg-[#1e1e1e] flex items-center justify-between px-4 border-b border-gray-800 z-50">
          <button onClick={() => view === 'read' ? setView('list') : onClose()} className="flex items-center gap-1 text-gray-300 hover:text-white"><ChevronLeft /> Back</button>
          <h3 className="font-bold text-sm truncate max-w-[200px]">{view === 'read' ? `Ep. ${currentChapter?.ch}` : manga.title}</h3>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#121212] scrollbar-hide">
          {view === 'list' && (
            <div className="max-w-4xl mx-auto pb-10">
               <div className="relative h-64 w-full">
                  <ImageWithFallback src={manga.images?.jpg?.large_image_url || manga.image} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute bottom-4 left-4"><h1 className="text-3xl font-bold drop-shadow-md">{manga.title}</h1></div>
               </div>
               <div className="p-4 grid md:grid-cols-2 gap-8">
                  <div>
                      <h2 className="text-green-500 font-bold mb-4 text-xl">Episodes</h2>
                      {loading && <Loader className="animate-spin mx-auto"/>}
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                         {chapters.map(ch => (
                            <div key={ch.id} onClick={() => openChapter(ch)} className="flex justify-between bg-[#1e1e1e] p-4 rounded cursor-pointer hover:bg-[#2a2a2a] border border-gray-800">
                               <span className="font-bold text-gray-200">Ep. {ch.ch}</span><span className="text-xs bg-gray-700 px-2 rounded text-gray-400">{ch.lang.toUpperCase()}</span>
                            </div>
                         ))}
                      </div>
                  </div>
                  <div>
                      <h2 className="text-blue-500 font-bold mb-4 text-xl flex items-center gap-2"><MessageSquare/> Comments</h2>
                      <form onSubmit={submitComment} className="flex gap-2 mb-6">
                          <input type="text" value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Say something..." className="flex-1 bg-[#1e1e1e] border border-gray-700 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"/>
                          <button type="submit" className="bg-blue-600 p-2 rounded hover:bg-blue-500"><Send size={18}/></button>
                      </form>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                          {comments.map(c => (
                              <div key={c._id} className="bg-[#1e1e1e] p-3 rounded border border-gray-800">
                                  <div className="flex justify-between items-baseline mb-1">
                                      <div className="flex items-center gap-2">
                                          {c.avatar && <img src={c.avatar} className="w-4 h-4 rounded-full object-cover"/>}
                                          <span className="font-bold text-sm text-green-400">{c.username}</span>
                                      </div>
                                      <span className="text-[10px] text-gray-500">{timeAgo(c.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-300 text-sm">{c.message}</p>
                              </div>
                          ))}
                      </div>
                  </div>
               </div>
            </div>
          )}
          {view === 'read' && (
             <div className="max-w-2xl mx-auto bg-black min-h-screen pb-20">
                 {pages.map((url, i) => <img key={i} src={url} className="w-full" loading="lazy" alt=""/>)}
                 <div className="p-6 grid grid-cols-2 gap-4 mt-8">
                     <button onClick={() => changeChapter(-1)} className="bg-gray-800 text-white py-3 rounded-lg font-bold"><ChevronLeft className="inline"/> Prev</button>
                     <button onClick={() => changeChapter(1)} className="bg-green-600 text-black py-3 rounded-lg font-bold">Next <ChevronRight className="inline"/></button>
                 </div>
             </div>
          )}
        </div>
      </div>
    );
}