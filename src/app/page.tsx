import FontShuffleText from "@/components/FontShuffleText";

export default function Home() {
	return (
		<main
			className="relative min-h-[100dvh] flex items-center justify-center px-5 sm:px-8 animate-fade-in"
			data-project-area="true"
		>
			<section className="w-full max-w-5xl text-center select-none">
				<h1 className="flex flex-col items-center text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-light tracking-tight text-primary">
					<FontShuffleText text="Mohammed" />
					<FontShuffleText text="Zeggaf" className="-mt-2 sm:-mt-4 md:-mt-6" widthScale={0.92} />
				</h1>
			</section>
		</main>
	);
}
