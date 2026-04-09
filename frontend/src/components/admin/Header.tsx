export const Header = ({ logout }: { logout: () => void }) => (
  <div className="flex justify-between items-center p-4 bg-white shadow">
    <h1 className="text-lg font-semibold">Trang quản trị</h1>
    <button onClick={logout} className="bg-pink-500 text-white px-4 py-2 rounded">
      Đăng xuất
    </button>
  </div>
);