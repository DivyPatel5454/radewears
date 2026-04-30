"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function ScrollingText() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const textX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const textXOpposite = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"]);

  return (
    <section 
      ref={containerRef}
      className="w-full bg-[#1a1a1a] py-32 md:py-48 overflow-hidden relative"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
      </div>

      <div className="flex flex-col gap-8 md:gap-16 relative z-10">
        <motion.div style={{ x: textX }} className="whitespace-nowrap flex">
          <h2 className="text-7xl md:text-9xl font-black text-transparent uppercase flex items-center gap-12" style={{ WebkitTextStroke: '2px #ffffff30' }}>
            <span>ELEVATE YOUR STYLE</span>
            <span className="text-[#cbbab0] opacity-80">*</span>
            <span>PREMIUM QUALITY</span>
            <span className="text-[#cbbab0] opacity-80">*</span>
            <span>MODERN DESIGN</span>
          </h2>
        </motion.div>

        <motion.div style={{ x: textXOpposite }} className="whitespace-nowrap flex">
          <h2 className="text-7xl md:text-9xl font-black text-white uppercase flex items-center gap-12">
            <span>COMFORT AND CONFIDENCE</span>
            <span className="text-[#cbbab0] opacity-40">*</span>
            <span>RADHEWEARS</span>
            <span className="text-[#cbbab0] opacity-40">*</span>
            <span>EVERYDAY WEAR</span>
          </h2>
        </motion.div>
      </div>

      {/* Center Reveal Image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none w-[60vw] md:w-[25vw] aspect-[4/5]">
        <motion.div 
          className="w-full h-full relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-20%" }}
        >
          <div className="absolute inset-0 bg-[#d0d0d0] z-0 rounded-sm shadow-2xl opacity-80 saturate-0 hover:saturate-100 transition-all duration-1000">
             {/* Replace with actual image later */}
             <div className="w-full h-full flex items-center justify-center text-white/50 text-sm font-light tracking-widest border border-white/20">
               COLLECTION
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
