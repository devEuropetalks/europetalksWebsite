export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About EuropeTalks</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p>
            EuropeTalks is dedicated to fostering cultural exchange and understanding among Europeans. 
            We believe in the power of dialogue to bridge differences and create lasting connections 
            across borders.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">What We Do</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Organize cultural exchange events and workshops</li>
            <li>Facilitate discussions on European topics</li>
            <li>Create opportunities for networking</li>
            <li>Support intercultural learning</li>
            <li>Promote European values and understanding</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Inclusivity</h3>
              <p>We welcome all Europeans regardless of background or beliefs.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Respect</h3>
              <p>We foster an environment of mutual respect and understanding.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Learning</h3>
              <p>We encourage continuous learning and personal growth.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p>We build strong connections and lasting friendships.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Join Us</h2>
          <p>
            Whether you&#39;re a student, professional, or simply interested in European 
            culture and connections, we invite you to join our community. Together, 
            we can build bridges across Europe and create meaningful relationships.
          </p>
        </section>
      </div>
    </div>
  )
} 