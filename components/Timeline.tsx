"use client";

import { motion } from "framer-motion";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  {
    year: "1973",
    title: "Founded",
    description: "1st Meath Dunboyne Scout Group was established by a small group of dedicated volunteers, initially running a single Scout Troop from a community hall in Dunboyne village.",
  },
  {
    year: "1979",
    title: "Beaver Colony Launched",
    description: "Recognising demand from younger children in the community, the group established its first Beaver Colony, extending scouting to children aged 6 and upwards.",
  },
  {
    year: "1985",
    title: "New Scout Den Opens",
    description: "After years of fundraising, the group opened its dedicated Scout Den on Rooske Road, a permanent home that remains the heart of the group to this day.",
  },
  {
    year: "1992",
    title: "Water Section Established",
    description: "Building on members' passion for the outdoors, a dedicated Water Section was founded, providing kayaking, canoeing and water safety training. The section became one of the group's most distinctive features.",
  },
  {
    year: "2001",
    title: "Joined Scouting Ireland",
    description: "Following the merger of Boy Scouts of Ireland and Catholic Boy Scouts of Ireland, 1st Meath Dunboyne became part of the new unified Scouting Ireland organisation.",
  },
  {
    year: "2008",
    title: "Ventures Section Added",
    description: "A Venture Scout Unit was established for older young people aged 15–18, completing the full range of sections and allowing young people to continue their scouting journey into late adolescence.",
  },
  {
    year: "2015",
    title: "200 Members Milestone",
    description: "The group surpassed 200 active youth members for the first time, reflecting the rapid growth of Dunboyne as a community and the group's strong reputation in the area.",
  },
  {
    year: "2023",
    title: "50th Anniversary",
    description: "1st Meath Dunboyne celebrated its 50th anniversary with a special family day at the Den, reuniting past and present members spanning five decades of scouting in the community.",
  },
];

export default function Timeline() {
  return (
    // overflow-hidden prevents the x-axis Framer Motion initial offset from
    // causing a horizontal scrollbar flash on mobile before the animation fires.
    <div className="relative overflow-hidden">
      {/* Mobile: left rail */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 md:hidden" />
      {/* Desktop: centre rail */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block" />

      <div className="space-y-6 md:space-y-0">
        {timelineData.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`relative md:flex md:items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} md:mb-12 pl-12 md:pl-0`}
            >
              {/* Mobile: orange dot on the left rail */}
              <div className="absolute left-[14px] top-6 w-3 h-3 bg-orange-main border-2 border-white rounded-full shadow-sm md:hidden" />

              {/* Card */}
              <div className={`md:w-5/12 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="inline-block bg-orange-main text-white text-xs font-body font-bold px-3 py-1 rounded-full mb-3">
                    {item.year}
                  </div>
                  <h3 className="font-display font-bold text-navy-dark text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-textMuted text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Desktop: centre dot */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-orange-main border-4 border-white rounded-full shadow-md" />

              {/* Desktop: spacer */}
              <div className="md:w-5/12" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

