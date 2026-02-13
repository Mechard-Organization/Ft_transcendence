import React from "react";
import Footer from "../ts/Footer";

type TeamMember = {
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  linkedin?: string;
  github?: string;
};

const team: TeamMember[] = [
  {
    name: "Lylou",
    role: "Développeuse Backend",
    avatarUrl: "/assets/imgs/abutet_round.png",
    bio: "Abutet",
    linkedin: "https://linkedin.com/in/lylou",
    github: "https://github.com/LylouGavmild"
  },
  {
    name: "Mehdi",
    role: "Developper",
    avatarUrl: "/assets/imgs/mel-yand_round.png",
    bio: "Mel-yand",
    linkedin: "https://linkedin.com/in/mehdi",
    github: "https://github.com/Shepardinio"
  },
  {
    name: "Maxime",
    role: "Developper",
    avatarUrl: "/assets/imgs/mechard_round.png",
    bio: "Mechard",
    linkedin: "https://www.linkedin.com/in/maxime-echard/",
    github: "https://github.com/M2000"
  },
  {
    name: "Abdul",
    role: "Developper",
    avatarUrl: "/assets/imgs/ajamshid_round.png",
    bio: "Ajamshid",
    linkedin: "https://linkedin.com/in/tonLinkedin",
    github: "https://github.com/ajamshid2000"
  },
  {
    name: "Jeanne",
    role: "Développeuse Front-end",
    avatarUrl: "/assets/imgs/jealefev_round.png",
    bio: "Jealefev",
    linkedin: "https://linkedin.com/in/tonLinkedin",
    github: "https://github.com/namoule"
  }
];

export default function AboutPage() {
  return (
    <div className="">
      <main className="flex-1 min-h-[calc(100dvh-60px-64px)] max-w-6xl mx-auto px-5 py-8">
        <h2 className="text-4xl font-extrabold text-center text-[#8B5A3C] mb-12 tracking-wide">
          À propos de notre équipe
        </h2>

        <div className="flex justify-center gap-6 flex-wrap">
        {team.map((member, idx) => (
            <div
            key={idx}
            className="bg-white/95 rounded-3xl shadow-lg border-4 border-[#FEE96E] p-6 flex flex-col items-center text-center transform transition hover:-translate-y-2 hover:shadow-2xl duration-300 w-44"
            >
            <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-22 h-22 rounded-full object-cover border-4 border-[#FEE96E] mb-4"
            />
            <h2 className="text-1xl font-bold text-[#8B5A3C] mb-1">{member.name}</h2>
            <p className="text-[#A67C52] italic mb-3">{member.role}</p>
            <p className="text-[#8B5A3C] text-sm mb-4">{member.bio}</p>

            <div className="flex gap-3">
                {member.linkedin && (
                <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#0077b5] text-white text-sm rounded-full hover:scale-105 transition"
                >
                    LinkedIn
                </a>
                )}
                {member.github && (
                <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#333] text-white text-sm rounded-full hover:scale-105 transition"
                >
                    GitHub
                </a>
                )}
            </div>
            </div>
        ))}
        </div>
        <br/>
        <div className="text-center">
                  <img
          src="/uploads/gif/thanks.gif"
          alt="thanks"
          className="w-60 h-75 rounded-xl margin-box"
        />
        </div>
      </main>


    </div>
  );
}
