const categories = [
  { id: 1, name: 'Tẩy trang', icon: '🧴', color: 'bg-blue-50 text-blue-500' },
  { id: 2, name: 'Sữa rửa mặt', icon: '🫧', color: 'bg-cyan-50 text-cyan-500' },
  { id: 7, name: 'Trang điểm', image: '/images/makeup.png', color: 'bg-white text-red-500' },
  { id: 3, name: 'Toner', icon: '💧', color: 'bg-teal-50 text-teal-500' },
  { id: 4, name: 'Serum', icon: '🧪', color: 'bg-purple-50 text-purple-500' },
  { id: 5, name: 'Kem dưỡng', icon: '🧁', color: 'bg-pink-50 text-pink-500' },
  { id: 6, name: 'Chống nắng', icon: '☀️', color: 'bg-yellow-50 text-yellow-500' },
  { id: 8, name: 'Chăm sóc cơ thể', icon: '🛀', color: 'bg-orange-50 text-orange-500' },
  { id: 9, name: 'Nước hoa', icon: '✨', color: 'bg-indigo-50 text-indigo-500' },
];

export const CategoryNav = () => {
  return (
    <section className="py-8 md:py-12 my-4 md:my-8 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center">
            <span className="w-1.5 h-6 bg-primary-500 rounded-full mr-3 inline-block"></span>
            Danh mục nổi bật
          </h3>
          <span className="text-sm font-bold text-primary-500 hover:text-primary-600 cursor-pointer hidden md:block">
            Xem tất cả →
          </span>
        </div>
        
        <div className="flex overflow-x-auto pt-4 pb-6 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:gap-8 justify-start lg:justify-between snap-x">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center min-w-[80px] md:min-w-[100px] group cursor-pointer snap-start">
              <div className={`w-16 h-16 md:w-24 md:h-24 ${cat.color} rounded-full flex items-center justify-center text-2xl md:text-4xl mb-3 shadow-sm border border-gray-100 group-hover:border-primary-200 transition-all group-hover:-translate-y-2 group-hover:shadow-lg overflow-hidden`}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  cat.icon
                )}
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-700 text-center group-hover:text-primary-600 transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
