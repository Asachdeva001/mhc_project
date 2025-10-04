export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm w-full">
      <h1 className="text-2xl font-bold text-blue-700">Mental Buddy</h1>
      <div className="space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Sign In
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Sign Up
        </button>
      </div>
    </nav>
  );
}
