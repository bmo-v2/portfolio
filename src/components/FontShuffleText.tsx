"use client";

import { useEffect, useMemo, useState } from "react";

const GLYPHS_PER_LETTER = 6;
const MIN_TICK_MS = 600;
const MAX_TICK_MS = 1300;
const MIN_SHADE = { r: 200, g: 194, b: 174 };
const MAX_SHADE = { r: 237, g: 234, b: 222 };

const defaultGlyphBuffers: Record<string, string[]> = {
	M: ["M", "𐌑", "𑜀", "𞊖", "ℳ", "𝗠"],
	o: ["o", "ο", "օ", "𐍉", "ℴ", "𝗈"],
	h: ["h", "һ", "հ", "𐌷", "𝒽", "𝗁"],
	a: ["a", "ɑ", "а", "𐌀", "𝒶", "𝖺"],
	m: ["ᛗ", "𝗆", "𑜀", "𝓂", "m", "𐌼"],
	e: ["e", "е", "℮", "𐌄", "ℯ", "𝖾"],
	d: ["d", "ԁ", "ժ", "𐌃", "𝒹", "𝖽"],
	Z: ["Z", "Ζ", "Ꮓ", "𐌆", "ℨ", "𝗭"],
	g: ["g", "ɡ", "ց", "𐌾", "ℊ", "𝗀"],
	f: ["f", "ƒ", "ғ", "𐌅", "𝒻", "𝖿"],
};

interface FontShuffleTextProps {
	text: string;
	className?: string;
	glyphBuffers?: string[][];
	widthScale?: number;
}

function fixedCellWidth(char: string) {
	if (char === " ") return 0.36;
	if ("mwMW".includes(char)) return 0.875;
	if ("ilI.,'".includes(char)) return 0.495;
	return 0.715;
}

function normalizeBuffer(char: string, buffer?: string[]) {
	const fallback = defaultGlyphBuffers[char] ?? Array(GLYPHS_PER_LETTER).fill(char);
	const source = buffer && buffer.length > 0 ? buffer : fallback;
	const normalized = source.slice(0, GLYPHS_PER_LETTER);

	while (normalized.length < GLYPHS_PER_LETTER) {
		normalized.push(normalized[normalized.length - 1] ?? char);
	}

	return normalized;
}

function randomShade() {
	const mix = Math.random();
	const r = Math.round(MIN_SHADE.r + (MAX_SHADE.r - MIN_SHADE.r) * mix);
	const g = Math.round(MIN_SHADE.g + (MAX_SHADE.g - MIN_SHADE.g) * mix);
	const b = Math.round(MIN_SHADE.b + (MAX_SHADE.b - MIN_SHADE.b) * mix);

	return `rgb(${r}, ${g}, ${b})`;
}

export default function FontShuffleText({ text, className = "", glyphBuffers, widthScale = 1 }: FontShuffleTextProps) {
	const characters = useMemo(() => Array.from(text), [text]);
	const [characterColors, setCharacterColors] = useState<string[]>(() =>
		characters.map(char => (char === " " ? "transparent" : "#EDEADE"))
	);
	const perLetterBuffers = useMemo(() => {
		let letterIndex = 0;

		return characters.map(char => {
			if (char === " ") return Array(GLYPHS_PER_LETTER).fill("\u00a0");

			const buffer = normalizeBuffer(char, glyphBuffers?.[letterIndex]);
			letterIndex += 1;
			return buffer;
		});
	}, [characters, glyphBuffers]);

	const [glyphPositions, setGlyphPositions] = useState(() => characters.map(() => 0));

	useEffect(() => {
		setCharacterColors(characters.map(char => (char === " " ? "transparent" : randomShade())));
	}, [characters]);

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (prefersReducedMotion) return;

		const timers: Array<{ timeout: number; interval?: number }> = [];

		characters.forEach((char, index) => {
			if (char === " ") return;

			const tick = MIN_TICK_MS + Math.random() * (MAX_TICK_MS - MIN_TICK_MS);
			const offset = Math.random() * tick;
			const timeout = window.setTimeout(() => {
				const interval = window.setInterval(() => {
					setGlyphPositions(current =>
						current.map((value, currentIndex) =>
							currentIndex === index ? (value + 1) % GLYPHS_PER_LETTER : value
						)
					);
				}, tick);

				timers[index].interval = interval;
			}, offset);

			timers[index] = { timeout };
		});

		return () => {
			timers.forEach(timer => {
				window.clearTimeout(timer.timeout);
				if (timer.interval) window.clearInterval(timer.interval);
			});
		};
	}, [characters]);

	return (
		<span className={className} aria-label={text}>
			<span aria-hidden="true" className="inline-flex whitespace-nowrap">
				{characters.map((char, index) => (
					<span
						key={`${char}-${index}`}
						className="inline-flex items-center justify-center text-center leading-none transition-opacity duration-200"
						style={{
							width: `${fixedCellWidth(char) * widthScale}em`,
							height: "1.28em",
							color: characterColors[index],
							opacity: char === " " ? 0 : 1,
							fontVariantLigatures: "none",
						}}
					>
						{perLetterBuffers[index][glyphPositions[index]]}
					</span>
				))}
			</span>
		</span>
	);
}
