import SmoothScroll from "@/components/home/SmoothScroll";
import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import PowerDiagram from "@/components/home/PowerDiagram";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <div id="top" className="w-full bg-bg font-body text-ink antialiased">
      <SmoothScroll />
      <main>
        <Hero />
        <Problem />
        <PowerDiagram />
        <HowItWorks />
      </main>
    </div>
  );
}
