import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Links = () => {
    return (
        <div className="flex items-center gap-6 pl-2">
            <a
                href="https://github.com/haguezoum"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-white-600 hover:text-white transition"
            >
                <FaGithub className="w-7 h-7" />
            </a>
            <a
                href="https://linkedin.com/in/hassan-aguezoum"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white-600 hover:text-white transition"
            >
                <FaLinkedin className="w-7 h-7" />
            </a>
            <a
                href="mailto:hassanaguezoum@gmail.com"
                aria-label="Email"
                className="text-white-600 hover:text-white transition"
            >
                <FaEnvelope className="w-7 h-7" />
            </a>
        </div>
    );
};

export default Links;