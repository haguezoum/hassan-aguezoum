import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const PHRASES = ["build", "design", "ship", "think", "feel"];

const TypeBadge = () => {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const dotRef = useRef(null);
    const typing = useRef(true);

    useEffect(() => {
        gsap.to(dotRef.current, {
            opacity: 0,
            repeat: -1,
            yoyo: true,
            duration: 0.5,
            ease: "none",
        });
    }, []);

    useEffect((): (() => void) | void => {
        const current = PHRASES[phraseIndex];
        let tween: gsap.core.Tween | undefined;

        if (typing.current) {
            tween = gsap.to({}, {
                duration: current.length * 0.08,
                onUpdate() {
                    const progress = this.progress();
                    const len = Math.floor(progress * current.length);
                    setDisplayed(current.slice(0, len));
                },
                onComplete() {
                    gsap.delayedCall(1.2, () => {
                        typing.current = false;
                        tween = gsap.to({}, {
                            duration: current.length * 0.04,
                            onUpdate() {
                                const progress = this.progress();
                                const len = Math.floor((1 - progress) * current.length);
                                setDisplayed(current.slice(0, len));
                            },
                            onComplete() {
                                typing.current = true;
                                setPhraseIndex((i) => (i + 1) % PHRASES.length);
                            },
                        });
                    });
                },
            });
        }

        return () => tween?.kill();
    }, [phraseIndex]);

    return (
        <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-white/40 tracking-widest uppercase">
                {displayed}
                <span ref={dotRef}>|</span>
            </span>
        </div>
    );
};

export default TypeBadge;