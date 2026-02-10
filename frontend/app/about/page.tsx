'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="dark" />
      
      {/* 1. Our Story Section */}
      <section className="relative px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-serif font-bold text-gray-900 lg:text-5xl">
              Hành Trình Mang Thế Giới <br /> Đến Gần Bạn Hơn
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Được thành lập với niềm tin rằng du lịch không chỉ là di chuyển, mà là sự trở về với chính mình. Tại <span className="font-bold text-orange-500">BookingAI</span>, chúng tôi kết hợp công nghệ AI tiên tiến với niềm đam mê xê dịch để xóa bỏ mọi rào cản trong việc tìm kiếm chốn nghỉ dưỡng hoàn hảo.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Sứ mệnh của chúng tôi là cá nhân hóa từng chuyến đi, giúp bạn tìm thấy không chỉ một nơi để ngủ, mà là một nơi để sống trọn vẹn từng khoảnh khắc.
            </p>
          </div>
          <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
             <img 
               src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
               alt="Our Journey" 
               className="h-full w-full object-cover"
             />
          </div>
        </div>
      </section>

      {/* 2. Our Stats Section */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-8">
           <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
              <div>
                 <div className="text-4xl font-bold text-orange-400 mb-2">1M+</div>
                 <div className="text-gray-300">Listing Khách sạn</div>
              </div>
              <div>
                 <div className="text-4xl font-bold text-orange-400 mb-2">500k+</div>
                 <div className="text-gray-300">Khách hàng hài lòng</div>
              </div>
              <div>
                 <div className="text-4xl font-bold text-orange-400 mb-2">150+</div>
                 <div className="text-gray-300">Quốc gia</div>
              </div>
              <div>
                 <div className="text-4xl font-bold text-orange-400 mb-2">24/7</div>
                 <div className="text-gray-300">Hỗ trợ toàn cầu</div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. The Team Section */}
      <section className="py-20 px-8 bg-gray-50">
         <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Những Người Kiến Tạo Giấc Mơ</h2>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">Đội ngũ lãnh đạo tâm huyết với khát vọng thay đổi cách thế giới đi du lịch.</p>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
               {[
                  { name: 'Alex Johnson', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop' },
                  { name: 'Sarah Lee', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop' },
                  { name: 'Michael Chen', role: 'CTO', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop' }
               ].map((member, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                     <div className="h-40 w-40 mx-auto rounded-full overflow-hidden mb-4 border-4 border-orange-100">
                        <img src={member.img} alt={member.name} className="h-full w-full object-cover" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                     <p className="text-orange-500 font-medium mb-4">{member.role}</p>
                     <div className="flex justify-center space-x-3">
                        {/* Fake Social Icons */}
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white cursor-pointer transition">in</div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-400 hover:text-white cursor-pointer transition">tw</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. Contact Section */}
      <section className="py-20 px-8">
         <div className="mx-auto max-w-4xl bg-orange-500 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-3xl font-bold mb-4">Chúng Tôi Luôn Ở Đây Vì Bạn</h2>
               <p className="mb-8 text-orange-100 text-lg">Bất kể bạn đang gặp khó khăn gì, hãy để chúng tôi hỗ trợ bạn 24/7.</p>
               <button className="bg-white text-orange-600 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  Chat Ngay
               </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-60 h-60 bg-white opacity-10 rounded-full"></div>
         </div>
      </section>
    </div>
  );
}
