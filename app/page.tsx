import SmoothScroll from "@/components/home/SmoothScroll";
import Hero from "@/components/home/Hero";
import Problem from "@/components/home/Problem";
import PowerDiagram from "@/components/home/PowerDiagram";
import HowItWorks from "@/components/home/HowItWorks";
import BuyerPost from "@/components/home/BuyerPost";
import IntentScore from "@/components/home/IntentScore";

export default function Home() {
  return (
    <div id="top" className="w-full bg-bg font-body text-ink antialiased">
      <SmoothScroll />
      <main>
        <Hero />
        <Problem />
        <PowerDiagram />
        <HowItWorks />
        <BuyerPost />
        <div id="intent">
          <IntentScore />
        </div>
      </main>
    </div>
  );
}
