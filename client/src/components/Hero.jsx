export default function Hero() {
  return (
    <section className="flex flex-col items-center text-center py-10">
      <h2 className="text-5xl font-extrabold text-gray-800">Your AI Wellness Companion</h2>
      <p className="mt-4 text-lg text-gray-600 max-w-xl">
        Take care of your mental health with personalized support, mood tracking, and wellness activities designed just for you.
      </p>
      <div className="mt-6 space-x-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">
          Get Started
        </button>
        <button className="px-6 py-3 bg-purple-500 text-white rounded-xl shadow hover:bg-purple-600">
          Sign In
        </button>
      </div>
    </section>
  );
}