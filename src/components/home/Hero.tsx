"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#ebe8e4]">
      {/* Background Split Layer */}
      <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
        <div className="w-full h-[55%] md:w-[60%] md:h-full bg-[#ebe8e4]"></div>
        <div className="w-full h-[45%] md:w-[40%] md:h-full bg-[#d0d0d0] relative overflow-hidden">
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src="/hero-model.png"
              alt="Milano Summer Collection Model"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top md:object-center scale-[1.02]"
            />
          </motion.div>
        </div>
      </div>

      {/* Decorative center straddling block */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-[40%] md:bottom-20 left-1/2 md:left-[60%] -translate-x-1/2 z-30 w-24 h-16 md:w-[7.5rem] md:h-[9.5rem] bg-[#cbbab0] opacity-80 backdrop-blur-sm mix-blend-multiply"
      />

      {/* Content Layer */}
      <div className="relative z-20 w-full h-full flex flex-col justify-start md:justify-center px-6 md:px-[6%] pt-32 md:pt-10">

        {/* Glowing blurred circle behind white text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-[35%] md:top-[52%] left-[10%] w-[60vw] h-[40vw] md:w-[30vw] md:h-[25vw] bg-[#cf9a5a]/70 rounded-full blur-[60px] md:blur-[80px] pointer-events-none mix-blend-multiply"
        />

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.1 }}
          className="w-full relative z-20"
        >
          {/* Main Typography */}
          <h1 className="font-extrabold uppercase leading-[0.85] tracking-tight whitespace-nowrap">
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="block text-black stroke-black text-[12vw] ml-[2vw]"
            >
              Get
            </motion.span>
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="block text-[#1a1a1a] text-[12vw] ml-[2vw]"
            > 
              Yourself
            </motion.span>
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block text-white text-[12vw] ml-[2vw] drop-shadow-sm"
            >
              Premium
            </motion.span>
            <motion.span
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="block text-white text-[12vw] ml-[2vw] drop-shadow-sm"
            >
              Stuff<span className="text-black">.</span>
            </motion.span>
          </h1>

          {/* CTA Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-10 md:mt-16 ml-[2vw] mb-4"
          >
            <Link
              href="/collections/summer"
              className="group flex items-center gap-2 w-fit text-[0.85rem] font-bold tracking-[0.15em] text-[#1a1a1a] hover:text-[#b4834e] transition-colors"
            >
              START SHOPPING NOW!
              <ArrowUpRight className="h-5 w-5 text-[#caa46e] group-hover:text-[#1a1a1a] transition-colors" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
