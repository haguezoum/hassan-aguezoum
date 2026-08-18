import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { LiaExternalLinkSquareAltSolid } from "react-icons/lia";
import { checkpoints } from "./checkpoints.json.ts";

export default function Experience() {
	const rowsRef = useRef([] as (HTMLElement | null)[]);

	useEffect(() => {
		gsap.fromTo(
			rowsRef.current,
			{ opacity: 0, x: -15 },
			{
				opacity: 1,
				x: 0,
				duration: 0.3,
				stagger: 0.06,
				ease: "power2.out",
			},
		);
	}, []);

	return (
		<>
			<h2 className="text-xl uppercase font-bold px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 lg:hidden">Checkpoints</h2>
			<div className="space-y-0">
				{checkpoints.map((checkpoint, idx) => (
					<article
						key={checkpoint.id}
						ref={(el) => {
							rowsRef.current[idx] = el;
						}}
						id={`checkpoint-${checkpoint.id}`}
						className="group py-6 sm:py-7 lg:py-8 px-4 sm:px-6 lg:px-8 hover:bg-neutral-900/10 transition-all duration-300"
					>
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<span className="text-xs text-neutral-500 font-bold tracking-widest">
										{checkpoint.type.toUpperCase()}
									</span>
									<h3 className="font-bold text-xl sm:text-2xl text-white tracking-tighter uppercase leading-none mt-2">
										{checkpoint.title}
									</h3>
									<p className="text-xs text-neutral-400 mt-1.5 uppercase tracking-wide">
										{checkpoint.organization}
									</p>
								</div>

								<span className="text-xs text-neutral-500 font-bold tracking-widest uppercase">
									{checkpoint.dateRange}
								</span>
							</div>

							<p className="font-light text-sm sm:text-base text-white/60 leading-relaxed tracking-tight group-hover:text-white transition-colors duration-300">
								{checkpoint.summary}
							</p>

							{checkpoint.details.length > 0 && (
								<ul className="space-y-2 text-sm text-white/55 leading-relaxed list-disc pl-5">
									{checkpoint.details.map((detail) => (
										<li key={detail}>{detail}</li>
									))}
								</ul>
							)}

							{checkpoint.techSkills.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{checkpoint.techSkills.map((skill) => (
										<span
											key={skill}
											className="px-2.5 py-0.5 border border-white/10 bg-black text-[10px] text-neutral-400 capitalize tracking-wide hover:border-white hover:text-white transition-colors rounded-none"
										>
											{skill}
										</span>
									))}
								</div>
							)}

							{checkpoint.link && (
								<a
									href={checkpoint.link}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors duration-200"
								>
									<LiaExternalLinkSquareAltSolid className="text-xl" />
									<span>OPEN LINK</span>
								</a>
							)}
						</div>
					</article>
				))}
			</div>
		</>
	);
}
