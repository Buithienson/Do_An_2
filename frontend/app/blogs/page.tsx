'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="dark" />
      
      {/* 1. Header */}
      <div className="pt-24 pb-12 px-8 text-center bg-white border-b">
         <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4">Travel Journal</h1>
         <p className="text-gray-500 text-lg max-w-2xl mx-auto">Nguồn cảm hứng bất tận cho những chuyến đi. Khám phá văn hóa, ẩm thực và những vùng đất mới cùng chúng tôi.</p>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12">
        
        {/* 2. Featured Article */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2 relative h-[500px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
               <img 
                  src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop" 
                  alt="Sapa" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
               <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 inline-block">Featured</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">Review chi tiết: 5 Resort "Chữa Lành" Tốt Nhất Tại Sapa 2026</h2>
                  <p className="text-gray-200 mb-4 hidden md:block max-w-xl">Trốn khỏi khói bụi thành phố, tìm về Sapa mùa mây phủ để tận hưởng không gian yên bình và dịch vụ đẳng cấp quốc tế...</p>
                  <span className="text-white font-bold decoration-orange-500 decoration-2 underline underline-offset-4 group-hover:text-orange-400 transition-colors">Đọc Tiếp &rarr;</span>
               </div>
            </div>
            
            {/* Sidebar / Trending Small */}
            <div className="lg:col-span-1 flex flex-col gap-6">
               <h3 className="font-bold text-xl text-gray-900 border-l-4 border-orange-500 pl-3">Mới Cập Nhật</h3>
               {[
                  { title: "Top 10 bãi biển đẹp nhất Phú Quốc", date: "Jan 12, 2026", img: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2000&auto=format&fit=crop" },
                  { title: "Bí kíp săn vé máy bay 0đ", date: "Jan 10, 2026", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" },
                  { title: "Ăn gì ở Đà Nẵng: 5 món ngon quên lối về", date: "Jan 08, 2026", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" },
               ].map((post, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer items-center">
                     <div className="h-20 w-24 rounded-lg overflow-hidden shrink-0">
                        <img src={post.img} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 mb-1">{post.date}</p>
                        <h4 className="font-bold text-gray-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">{post.title}</h4>
                     </div>
                  </div>
               ))}
               
               {/* Categories Pills */}
               <div className="pt-4">
                 <h3 className="font-bold text-xl text-gray-900 border-l-4 border-orange-500 pl-3 mb-4">Chủ Đề</h3>
                 <div className="flex flex-wrap gap-2">
                    {['#CẩmNangDuLịch', '#ReviewKháchSạn', '#SănVéRẻ', '#ẨmThực', '#SoloTravel', '#LuxuryEscape'].map((tag) => (
                       <span key={tag} className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full hover:bg-orange-100 hover:text-orange-600 cursor-pointer transition-colors">
                          {tag}
                       </span>
                    ))}
                 </div>
               </div>
            </div>
        </div>

        {/* 3. Grid Articles */}
        <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
               <span className="text-3xl">☕</span> Cafe & Chill
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer group">
                     <div className="h-56 overflow-hidden">
                        <img 
                           src={`https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop&sig=${item}`} 
                           alt="" 
                           className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                     </div>
                     <div className="p-6">
                        <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">Lifestyle</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                           Những quán cafe view đẹp nhất Đà Lạt bạn nhất định phải ghé năm 2026
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                           Đà Lạt không chỉ có hoa và sương mù, mà còn có những góc quán nhỏ xinh xắn để bạn nhâm nhi tách cafe nóng hổi...
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                           <span className="text-sm font-medium text-gray-700">Admin</span>
                           <span className="text-sm text-gray-400">• 5 min read</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
        </div>

        {/* 4. Newsletter */}
        <div className="bg-gray-900 rounded-3xl p-12 text-center relative overflow-hidden">
           <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-orange-400 font-bold tracking-wider uppercase text-sm mb-2 block">Newsletter</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Đừng Bỏ Lỡ Ưu Đãi</h2>
              <p className="text-gray-400 mb-8 text-lg">Nhận ngay cẩm nang du lịch độc quyền và mã giảm giá <span className="text-white font-bold">10%</span> gửi thẳng vào inbox của bạn hàng tuần.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                    type="email" 
                    placeholder="Nhập email của bạn..." 
                    className="flex-1 rounded-full px-6 py-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                 />
                 <button className="bg-orange-500 text-white font-bold px-8 py-4 rounded-full hover:bg-orange-600 transition-colors shadow-lg">
                    Đăng Ký
                 </button>
              </div>
              <p className="text-gray-500 text-xs mt-4">Cam kết không spam. Hủy đăng ký bất cứ lúc nào.</p>
           </div>
           
           {/* Background decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

      </div>
    </div>
  );
}
