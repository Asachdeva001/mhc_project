export default function Features() {
  const features = [
    { icon: "💬", title: "AI Chat Support", desc: "Get instant, personalized mental health support whenever you need it." },
    { icon: "📊", title: "Mood Tracking", desc: "Track your emotional patterns and see your progress over time." },
    { icon: "🧘", title: "Wellness Activities", desc: "Discover activities and exercises to boost your wellbeing." },
    { icon: "🎮", title: "Games", desc: "Engage in fun, interactive games designed to reduce stress and improve focus." }, // New feature
  ];

  return (
    <section className="grid md:grid-cols-4 gap-6 px-10 py-6 bg-white rounded-t-3xl shadow-lg">
      {features.map((f, i) => (
        <div key={i} className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-md transition">
          <div className="text-4xl mb-3">{f.icon}</div>
          <h3 className="text-xl font-bold text-gray-700">{f.title}</h3>
          <p className="mt-2 text-gray-600">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}
