import useEmblaCarousel from "embla-carousel-react";

function Slider() {
    const [emblaRef] = useEmblaCarousel()

    return (
        <div className="embla" ref={emblaRef}>
            <div className="embla__container">
                <div className="embla__slide">
                    <div className="h-[500px] flex flex-col justify-end bg-cover bg-center relative z-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1470&h=600&fit=crop')"}}>
                        <div className="absolute left-0 top-0 w-full h-full z-0 bg-gradient-to-t from-black/80 to-black/10"></div>
                        <div className="container mx-auto mb-10">
                            <span className="text-white mb-2 relative text-sm">23 Nov 2025</span>
                            <h3 className="text-4xl font-bold text-white relative">The latest news in gaming</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Slider;

