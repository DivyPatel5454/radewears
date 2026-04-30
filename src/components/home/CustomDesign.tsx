"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

export function CustomDesign() {
  return (
    <section className="w-full bg-white py-24 md:py-32 px-6 md:px-[6%] relative z-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={containerVariants}
           className="mb-8 md:mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9]"
          >
            <span
              className="font-light text-transparent bg-clip-text stroke-text block mb-2"
              style={{ WebkitTextStroke: "1px #1a1a1a", color: "transparent" }}
            >
              Radhewears
            </span>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#426df5] via-[#8f9df0] to-[#cba68c]">
              Custom Design.
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* Text Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="flex flex-col items-start pt-2 lg:pt-4 lg:pr-10"
          >
            <motion.p
              variants={itemVariants}
              className="text-[#426df5] text-base md:text-lg font-bold leading-relaxed mb-16 md:mb-24"
            >
              We offer custom designs that let you fully personalize your t-shirt just the way you like. You can choose any color for the text, making it easy to match your style, mood, or brand. Whether you want something bold and eye-catching or simple and clean, you have complete control over how your design looks.
            </motion.p>

            <motion.div variants={itemVariants} className="ml-12 md:ml-16 lg:ml-24 w-full md:w-auto flex justify-start">
              <Link
                href="/custom-design"
                className="inline-flex items-center justify-center bg-[#4f6cf5] text-white font-bold text-2xl py-5 px-14 rounded-[2rem] hover:bg-[#3b55d9] transition-all shadow-md shadow-[#426df5]/20 hover:shadow-[#426df5]/40"
              >
                Try now!
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto"
          >
            <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden bg-[#f4f4f4]">
              <Image
                src="/custom_hoodie_model.png"
                alt="Custom printed hoodie example"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
