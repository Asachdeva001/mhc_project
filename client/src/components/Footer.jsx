export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-600 to-indigo-500 py-2 text-center text-white shadow-inner">
      © {new Date().getFullYear()} Mental Buddy
    </footer>
  );
}
