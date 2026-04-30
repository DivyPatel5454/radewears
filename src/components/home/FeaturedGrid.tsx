"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export function FeaturedGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={containerRef} className="w-full bg-[#f8f7f5] py-32 md:py-48 px-6 md:px-[6%] overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto min-h-[80vh] flex flex-col md:flex-row items-center gap-12 md:gap-20">
        
        {/* Left text column */}
        <div className="w-full md:w-1/3 flex flex-col z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-[#1a1a1a] leading-[1.1] tracking-tight mb-8">
              Beyond Just <br/>
              <span className="text-[#cf9a5a] italic font-serif font-medium">Clothing &</span><br/>
              Apparel
            </h2>
            <p className="text-[#4a4a4a] text-lg font-medium leading-relaxed max-w-sm mb-12">
              We also offer a curated selection of lifestyle goods. From modern accessories and distinct photo frames to car enthusiast goods and aesthetic car posters, discover products that complement your world.
            </p>
            <button className="w-fit text-sm font-bold tracking-[0.15em] text-[#1a1a1a] border-b-2 border-[#1a1a1a] pb-1 hover:text-[#cf9a5a] hover:border-[#cf9a5a] transition-all uppercase">
              Explore Lifestyle
            </button>
          </motion.div>
        </div>

        {/* Right Images grid */}
        <div className="w-full md:w-2/3 grid grid-cols-2 gap-4 md:gap-8 h-full relative">
          <motion.div style={{ y: y1 }} className="flex flex-col gap-4 md:gap-8 mt-16 md:mt-32">
            
            {/* Box 1: Accessories */}
            <div className="w-full aspect-[4/5] bg-[#e2ded9] relative overflow-hidden group flex items-end p-6">
              <Image src="/purse.png" alt="Accessories" fill className="object-cover transition-transform duration-700 group-hover:scale-105 z-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 z-10" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="absolute top-4 left-4 z-20 text-white font-bold tracking-widest text-xs uppercase mix-blend-difference">
                01.
              </div>
              <h3 className="relative z-20 text-2xl font-bold tracking-tight text-white drop-shadow-md">Accessories</h3>
            </div>
            
            {/* Box 2: Photo Frame */}
            <div className="w-full aspect-square bg-[#cbbab0] relative overflow-hidden group flex items-end p-6">
               <Image src="/photofram.png" alt="Photo Frames" fill className="object-cover transition-transform duration-700 group-hover:scale-105 z-0" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 z-10" />
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
               <div className="absolute top-4 left-4 z-20 text-white font-bold tracking-widest text-xs uppercase mix-blend-difference">
                 02.
               </div>
               <h3 className="relative z-20 text-2xl font-bold tracking-tight text-white drop-shadow-md">Photo Frames</h3>
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="flex flex-col gap-4 md:gap-8 -mt-16 md:-mt-32">
             
             {/* Box 3: Car Enthusiast */}
             <div className="w-full aspect-square bg-[#d5d2cd] relative overflow-hidden group flex items-end p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50 z-10" />
                <div className="absolute top-4 left-4 z-20 text-[#1a1a1a] font-bold tracking-widest text-xs uppercase">
                  03.
                </div>
                <h3 className="relative z-20 text-2xl font-bold tracking-tight text-[#1a1a1a]">Car Enthusiast</h3>
             </div>
             
             {/* Box 4: Car Poster */}
             <motion.div style={{ y: y3 }} className="w-full aspect-[3/4] bg-[#a9a19c] relative overflow-hidden group flex items-end p-6">
                <Image src="/carposter.png" alt="Car Posters" fill className="object-cover transition-transform duration-700 group-hover:scale-105 z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 z-10" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="absolute top-4 left-4 z-20 text-white font-bold tracking-widest text-xs uppercase mix-blend-difference">
                  04.
                </div>
                <h3 className="relative z-20 text-2xl font-bold tracking-tight text-white drop-shadow-md">Car Posters</h3>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                  <div className="w-24 h-24 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-sm bg-black/20 text-white shadow-xl">
                    <span className="text-white text-xs font-bold tracking-widest uppercase">View</span>
                  </div>
                </div>
             </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
