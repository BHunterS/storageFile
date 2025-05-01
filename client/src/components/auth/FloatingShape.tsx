import { CSSProperties } from "react";

import { motion } from "framer-motion";


interface FloatingShapeProps {
	color: string;
	size: string;
	top: string | number;
	left: string | number;
	delay?: number;
}

const FloatingShape: React.FC<FloatingShapeProps> = ({
	color,
	size,
	top,
	left,
	delay = 0,
}) => {
	return (
		<motion.div
			className={`absolute rounded-full ${color} ${size} opacity-20 blur-xl`}
			style={{ top, left } as CSSProperties}
			animate={{
				y: ["0%", "100%", "0%"],
				x: ["0%", "100%", "0%"],
				rotate: [0, 360],
			}}
			transition={{
				duration: 20,
				ease: "linear",
				repeat: Infinity,
				delay,
			}}
			aria-hidden="true"
		/>
	);
};

export default FloatingShape;
