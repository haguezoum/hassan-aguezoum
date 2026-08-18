import { LiaExternalLinkSquareAltSolid } from "react-icons/lia";
import { type Project } from "./projects.json.ts";

interface Props {
  project: Project;
  idx: number;
  innerRef: (el: HTMLDivElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  dimmed: boolean;
}

export default function ProjectCard({
  project,
  idx,
  innerRef,
  onMouseEnter,
  onMouseLeave,
  dimmed,
}: Props) {
  const numStr = String(idx + 1).padStart(2, "0");
  const primaryHref = project.repo || project.url;
  const subtitle = project.repo
    ? project.repo.replace("https://github.com/", "")
    : project.url
      ? new URL(project.url).host
      : "";

  return (
    <div
      ref={innerRef}
      id={`editorial-project-${project.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ opacity: dimmed ? 0.5 : 1 }}
      className={
        "group py-6 sm:py-7 lg:py-8 px-4 sm:px-6 lg:px-8 hover:bg-neutral-900/10 transition-all duration-300"
      }
    >
      <div className="flex flex-col gap-4">
        {/* Section number */}
        <span className="text-xs text-neutral-500 font-bold tracking-widest">
          PROJECT {numStr}
        </span>

        {/* Title */}
        <div>
          {primaryHref ? (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 group/title"
            >
              <LiaExternalLinkSquareAltSolid className="text-white/60 group-hover:text-white transition-colors duration-200 text-2xl sm:text-3xl font-thin" />
              <h2
                data-value={project.name}
                className="font-bold text-xl sm:text-2xl text-white tracking-tighter uppercase leading-none"
              >
                {project.name}
              </h2>
            </a>
          ) : (
            <h2
              data-value={project.name}
              className="font-bold text-xl sm:text-2xl text-white tracking-tighter uppercase leading-none"
            >
              {project.name}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1.5 uppercase tracking-wide">
              {subtitle}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="font-light text-sm sm:text-base text-white/60 leading-relaxed tracking-tight group-hover:text-white transition-colors duration-300">
          {project.description}
        </p>

        {/* Deploy link */}
        {project.url && (
          <div className="text-[11px] text-neutral-500">
            <div className="flex items-center gap-1">
              DEPLOY:{" "}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 underline font-semibold flex items-center gap-0.5 hover:text-white"
              >
                <span>ONLINE INSTANCE</span>
              </a>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 border border-white/10 bg-black text-[10px] text-neutral-400 capitalize tracking-wide hover:border-white hover:text-white transition-colors rounded-none"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
