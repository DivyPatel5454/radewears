import { Hero } from "@/components/home/Hero";
import { NewProducts } from "@/components/home/NewProducts";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { ScrollingText } from "@/components/home/ScrollingText";
import { CustomDesign } from "@/components/home/CustomDesign";
import { YouMayAlsoLike } from "@/components/products/YouMayAlsoLike";

export default function Home() {
  return (
    <main className="flex-grow">
      <Hero />
      <NewProducts />
      <CustomDesign />
      <ScrollingText />
      <FeaturedGrid />
      <YouMayAlsoLike />
    </main>
  );
}
