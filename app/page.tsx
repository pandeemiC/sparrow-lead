import SmoothScroll from "@/components/home/SmoothScroll";
import Hero from "@/components/home/Hero";

export default function Home() {
  return (
    <div id="top" className="w-full bg-bg font-body text-ink antialiased">
      <SmoothScroll />
      <main>
        <Hero />
      </main>
    </div>
  );
}
