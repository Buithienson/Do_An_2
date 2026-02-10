'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500 selection:text-black">
      <Navbar variant="transparent" />
      
      {/* 1. Hero Concept - Dark & Gold Mode */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-6e54721a761c?q=80&w=2080&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="relative z-10 text-center max-w-3xl px-6">
           <span className="inline-block py-1 px-3 border border-yellow-500 text-yellow-500 rounded-full text-xs font-bold tracking-widest uppercase mb-4">Exclusive Membership</span>
           <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">
             Nâng Tầm Trải Nghiệm
           </h1>
           <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
             Trở thành thành viên Premium để mở khóa những đặc quyền giới hạn và tận hưởng kỳ nghỉ thượng lưu đúng nghĩa.
           </p>
           <button className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold py-4 px-10 rounded-full hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all transform hover:-translate-y-1">
             Tham Gia Ngay
           </button>
        </div>
      </section>

      {/* 2. Membership Benefits */}
      <section className="py-20 px-8">
        <div className="mx-auto max-w-7xl">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-yellow-500 mb-4">Đặc Quyền Của Bạn</h2>
              <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                 { icon: '✨', title: 'Ưu Đãi Đặc Biệt', desc: 'Giảm thêm 15% cho mọi đặt phòng khách sạn & resort 5 sao trên toàn cầu.' },
                 { icon: '🕒', title: 'Linh Hoạt Thời Gian', desc: 'Miễn phí check-in sớm (từ 10h sáng) và check-out muộn (tới 4h chiều).' },
                 { icon: '🍷', title: 'Quyền Lợi VIP', desc: 'Miễn phí đồ uống chào mừng, nâng hạng phòng tự động và quyền vào Club Lounge.' }
              ].map((item, idx) => (
                 <div key={idx} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl hover:border-yellow-600 transition-colors group">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. Luxury Collection */}
      <section className="py-20 px-8 bg-gray-900/50">
        <div className="mx-auto max-w-7xl">
           <div className="flex justify-between items-end mb-12">
               <div>
                  <h2 className="text-4xl font-serif font-bold text-white">Handpicked For You</h2>
                  <p className="text-gray-400 mt-2">Bộ sưu tập resort độc quyền chỉ dành riêng cho bạn.</p>
               </div>
               <a href="#" className="text-yellow-500 hover:text-yellow-400 font-medium hidden md:block">Xem tất cả -&gt;</a>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[
                { name: 'Amanoi Resort', location: 'Ninh Thuan, Vietnam', price: '$1,200', img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop' },
                { name: 'Six Senses', location: 'Con Dao, Vietnam', price: '$950', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop' }
             ].map((hotel, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-3xl cursor-pointer">
                   <div className="h-[400px] w-full overflow-hidden">
                      <img src={hotel.img} alt={hotel.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                   <div className="absolute bottom-0 left-0 p-8 w-full">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-yellow-500 text-sm font-bold uppercase tracking-wider mb-1">Luxury Villa</p>
                            <h3 className="text-3xl font-serif font-bold text-white mb-2">{hotel.name}</h3>
                            <p className="text-gray-300 flex items-center gap-1">📍 {hotel.location}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-gray-300 text-sm">Từ</p>
                            <p className="text-2xl font-bold text-white">{hotel.price}<span className="text-sm font-normal text-gray-400">/đêm</span></p>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* 4. Pricing Plans */}
      <section className="py-24 px-8">
         <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-16 text-white">Lựa Chọn Gói Thành Viên</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Silver */}
               <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:scale-105 transition-transform">
                  <h3 className="text-xl font-bold text-gray-300 mb-4">Silver</h3>
                  <div className="text-4xl font-bold text-white mb-6">Free</div>
                  <ul className="text-gray-400 space-y-4 text-left mb-8">
                     <li className="flex gap-2">✓ Tích điểm cơ bản</li>
                     <li className="flex gap-2">✓ Bản tin ưu đãi</li>
                     <li className="flex gap-2">✓ Hỗ trợ tiêu chuẩn</li>
                  </ul>
                  <button className="w-full py-3 rounded-xl border border-gray-500 text-white font-bold hover:bg-gray-700">Hiện tại</button>
               </div>
               
               {/* Gold */}
               <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-yellow-600 relative transform md:-translate-y-4 shadow-2xl hover:scale-[1.02] transition-transform">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-600 text-black font-bold px-4 py-1 rounded-full text-sm">Most Popular</div>
                  <h3 className="text-xl font-bold text-yellow-500 mb-4">Gold</h3>
                  <div className="text-4xl font-bold text-white mb-6">$49<span className="text-sm text-gray-400 font-normal">/năm</span></div>
                  <ul className="text-gray-300 space-y-4 text-left mb-8">
                     <li className="flex gap-2 text-white">✓ <strong>Giảm 10%</strong> mọi booking</li>
                     <li className="flex gap-2">✓ Ưu tiên hỗ trợ 24/7</li>
                     <li className="flex gap-2">✓ Check-in sớm miễn phí</li>
                     <li className="flex gap-2">✓ Quà tặng sinh nhật</li>
                  </ul>
                  <button className="w-full py-3 rounded-xl bg-yellow-600 text-black font-bold hover:bg-yellow-500 transition-colors">Nâng Cấp Ngay</button>
               </div>

               {/* Diamond */}
               <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:scale-105 transition-transform">
                  <h3 className="text-xl font-bold text-blue-300 mb-4">Diamond</h3>
                  <div className="text-4xl font-bold text-white mb-6">$99<span className="text-sm text-gray-400 font-normal">/năm</span></div>
                  <ul className="text-gray-400 space-y-4 text-left mb-8">
                     <li className="flex gap-2">✓ <strong>Giảm 15%</strong> trọn đời</li>
                     <li className="flex gap-2">✓ Phòng chờ thương gia</li>
                     <li className="flex gap-2">✓ Trợ lý du lịch cá nhân</li>
                  </ul>
                  <button className="w-full py-3 rounded-xl border border-gray-500 text-white font-bold hover:bg-gray-700">Liên hệ</button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
